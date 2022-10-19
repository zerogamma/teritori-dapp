package marketplace

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/Khan/genqlient/graphql"
	"github.com/TERITORI/teritori-dapp/go/internal/collections"
	"github.com/TERITORI/teritori-dapp/go/internal/faking"
	"github.com/TERITORI/teritori-dapp/go/internal/indexerdb"
	"github.com/TERITORI/teritori-dapp/go/internal/ipfsutil"
	"github.com/TERITORI/teritori-dapp/go/pkg/holagql"
	"github.com/TERITORI/teritori-dapp/go/pkg/marketplacepb"
	"github.com/bxcodec/faker/v3"
	"github.com/pkg/errors"
	"github.com/volatiletech/sqlboiler/v4/queries"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type MarkteplaceService struct {
	marketplacepb.UnimplementedMarketplaceServiceServer

	upcomingLaunchesProvider            collections.CollectionsProvider
	collectionsByVolumeProvider         collections.CollectionsProvider
	collectionsByMarketCapProvider      collections.CollectionsProvider
	teritoriFeaturesCollectionsProvider collections.CollectionsProvider
	conf                                *Config
}

type Config struct {
	Logger             *zap.Logger
	IndexerDB          *gorm.DB
	GraphqlEndpoint    string
	TNSContractAddress string
	TNSDefaultImageURL string
}

func NewMarketplaceService(ctx context.Context, conf *Config) *MarkteplaceService {
	// FIXME: validate config
	return &MarkteplaceService{
		conf:                                conf,
		upcomingLaunchesProvider:            collections.NewUpcomingLaunchesProvider(ctx, conf.Logger),
		collectionsByVolumeProvider:         collections.NewCollectionsByVolumeProvider(ctx, conf.GraphqlEndpoint, conf.Logger),
		collectionsByMarketCapProvider:      collections.NewCollectionsByMarketCapProvider(ctx, conf.GraphqlEndpoint, conf.Logger),
		teritoriFeaturesCollectionsProvider: collections.NewTeritoriCollectionsProvider(conf.IndexerDB, conf.Logger),
	}
}

func (s *MarkteplaceService) Collections(req *marketplacepb.CollectionsRequest, srv marketplacepb.MarketplaceService_CollectionsServer) error {
	limit := req.GetLimit()
	if limit <= 0 {
		return errors.New("limit must be a positive number")
	}

	offset := req.GetOffset()
	if offset < 0 {
		return errors.New("offset must be greater or equal to 0")
	}

	switch req.GetKind() {

	case marketplacepb.CollectionsRequest_KIND_UPCOMING:
		launches := s.upcomingLaunchesProvider.Collections(int(limit), int(offset))
		for launch := range launches {
			if err := srv.Send(&marketplacepb.CollectionsResponse{Collection: launch}); err != nil {
				return errors.Wrap(err, "failed to send collection")
			}
		}
		return nil

	case marketplacepb.CollectionsRequest_KIND_BY_VOLUME:
		collections := s.collectionsByVolumeProvider.Collections(int(limit), int(offset))
		for collection := range collections {
			if err := srv.Send(&marketplacepb.CollectionsResponse{Collection: collection}); err != nil {
				return errors.Wrap(err, "failed to send collection")
			}
		}
		return nil

	case marketplacepb.CollectionsRequest_KIND_BY_MARKETCAP:
		collections := s.collectionsByMarketCapProvider.Collections(int(limit), int(offset))
		for collection := range collections {
			if err := srv.Send(&marketplacepb.CollectionsResponse{Collection: collection}); err != nil {
				return errors.Wrap(err, "failed to send collection")
			}
		}
		return nil

	case marketplacepb.CollectionsRequest_KIND_TERITORI_FEATURES:
		s.conf.Logger.Info("fetch teritori features collections")
		collections := s.teritoriFeaturesCollectionsProvider.Collections(int(limit), int(offset))
		for collection := range collections {
			s.conf.Logger.Info("fetched teritori collection", zap.Any("collection", collection))
			if err := srv.Send(&marketplacepb.CollectionsResponse{Collection: collection}); err != nil {
				return errors.Wrap(err, "failed to send collection")
			}
		}
		return nil

	case marketplacepb.CollectionsRequest_KIND_FAKE:
		for i := int32(0); i < limit; i++ {
			if err := srv.Send(&marketplacepb.CollectionsResponse{Collection: faking.FakeCollection()}); err != nil {
				return errors.Wrap(err, "failed to send collection")
			}
		}
		return nil

	}

	return fmt.Errorf("unknown collection list kind %s", req.GetKind().String())
}

type NFTOwnerInfo struct {
	Name     string
	ImageURL string
}

func (s *MarkteplaceService) NFTs(req *marketplacepb.NFTsRequest, srv marketplacepb.MarketplaceService_NFTsServer) error {
	// NOTE: we should probably query the graphql api from the client directly in this case

	limit := req.GetLimit()
	if limit <= 0 {
		return errors.New("limit must be a positive number")
	}

	offset := req.GetOffset()
	if offset < 0 {
		return errors.New("offset must be greater or equal to 0")
	}

	collection_id := req.GetCollectionId()

	// FIXME: return fake data if any filter is fake
	if strings.HasPrefix(collection_id, marketplacepb.Network_NETWORK_FAKE.Prefix()) {
		for i := int32(0); i < limit; i++ {
			if err := srv.Send(&marketplacepb.NFTsResponse{Nft: faking.FakeNFT()}); err != nil {
				return errors.Wrap(err, "failed to send nft")
			}
		}
		return nil
	}

	// FIXME: support other filters on solana
	if strings.HasPrefix(collection_id, marketplacepb.Network_NETWORK_SOLANA.Prefix()) {
		gqlClient := graphql.NewClient(s.conf.GraphqlEndpoint, nil)

		collectionNFTs, err := holagql.GetCollectionNFTs(srv.Context(), gqlClient,
			strings.TrimPrefix(collection_id, marketplacepb.Network_NETWORK_SOLANA.Prefix()+"-"),
			int(limit),
			int(offset),
		)
		if err != nil {
			return errors.Wrap(err, "failed to fetch collection nfts")
		}

		for _, nft := range collectionNFTs.GetNfts() {
			price := ""
			if len(nft.GetListings()) != 0 {
				price = nft.GetListings()[0].GetPrice()
			}
			if err := srv.Send(&marketplacepb.NFTsResponse{Nft: &marketplacepb.NFT{
				Name:        nft.GetName(),
				MintAddress: nft.GetMintAddress(),
				ImageUri:    nft.GetImage(),
				Price:       price,
				Denom:       "lamports",
			}}); err != nil {
				return errors.Wrap(err, "failed to send nft")
			}
		}
		return nil
	}

	// teritori
	type NFTWithExtra struct {
		indexerdb.NFT     `boil:",bind"`
		CollectionName    string
		CollectionNetwork int
		OwnerImage        string
		Tns               string
	}
	db, err := s.conf.IndexerDB.DB()
	if err != nil {
		return errors.Wrap(err, "failed to get database from gorm.DB object")
	}
	ownerId := req.GetOwnerId()
	query := fmt.Sprintf(`
	with 
	user_image as (
		select id user_id, primary_tns tns, (select image_uri from nfts where id = '%s-'||'%s-'||u.primary_tns ) image_url 
		from users u
	)
	SELECT nfts.*,
	(select image_url from user_image where user_id = nfts.owner_id ) owner_image, 
	(select tns from user_image where user_id = nfts.owner_id ) tns, c.network collection_network, c.name collection_name FROM nfts
		INNER join teritori_nfts tn on tn.nft_id = nfts.id
		INNER join collections c on c.id = nfts.collection_id
		where (collection_id = $1 or $1 = '') AND (owner_id = $2 or $2 = '')
	ORDER BY nfts.is_listed DESC, nfts.price_amount ASC
	LIMIT $3
	OFFSET $4
	`, marketplacepb.Network_NETWORK_TERITORI.Prefix(), s.conf.TNSContractAddress)
	rows, err := db.QueryContext(context.Background(), query, collection_id, ownerId, limit, offset)
	if err != nil && err != sql.ErrNoRows {
		return errors.Wrap(err, "failed query nfts")
	}
	var nfts []NFTWithExtra
	err = queries.Bind(rows, &nfts)
	if err != nil {
		return errors.Wrap(err, "failed binding query to NFTWithExtra object")
	}
	tnsId := indexerdb.TeritoriCollectionID(s.conf.TNSContractAddress)
	for _, nft := range nfts {
		imageURI := nft.ImageURI
		textInsert := ""

		// tns-specific
		if nft.CollectionID == tnsId {
			textInsert = nft.Name
			if imageURI == "" {
				imageURI = s.conf.TNSDefaultImageURL
			}
		}
		if err := srv.Send(&marketplacepb.NFTsResponse{Nft: &marketplacepb.NFT{
			Id:             nft.ID,
			Name:           nft.Name,
			CollectionName: nft.CollectionName,
			Network:        marketplacepb.Network(nft.CollectionNetwork),
			ImageUri:       ipfsutil.IPFSURIToURL(imageURI),
			IsListed:       nft.IsListed,
			Price:          nft.PriceAmount,
			Denom:          nft.PriceDenom,
			TextInsert:     textInsert,
			OwnerId:        string(nft.OwnerID),
			OwnerName:      nft.Tns,
			OwnerImageUrl:  ipfsutil.IPFSURIToURL(nft.OwnerImage),
		}}); err != nil {
			return errors.Wrap(err, "failed to send nft")
		}
	}

	return nil
}

func (s *MarkteplaceService) CollectionActivity(req *marketplacepb.CollectionActivityRequest, srv marketplacepb.MarketplaceService_CollectionActivityServer) error {
	// TODO: we should use a time cursor based pagination instead of limit and offset

	limit := req.GetLimit()
	if limit <= 0 {
		return errors.New("limit must be a positive number")
	}

	offset := req.GetOffset()
	if offset < 0 {
		return errors.New("offset must be greater or equal to 0")
	}

	id := req.GetId()
	if id == "" {
		return errors.New("empty mint address")
	}

	if strings.HasPrefix(id, marketplacepb.Network_NETWORK_FAKE.Prefix()) {
		for i := int32(0); i < limit; i++ {
			if err := srv.Send(&marketplacepb.CollectionActivityResponse{Activity: faking.FakeActivity()}); err != nil {
				return errors.Wrap(err, "failed to send activity")
			}
		}
		return nil
	}

	if strings.HasPrefix(id, marketplacepb.Network_NETWORK_SOLANA.Prefix()) {
		gqlClient := graphql.NewClient(s.conf.GraphqlEndpoint, nil)

		collectionActivity, err := holagql.GetCollectionActivity(srv.Context(), gqlClient,
			strings.TrimPrefix(id, marketplacepb.Network_NETWORK_SOLANA.Prefix()+"-"),
			int(limit),
			int(offset),
		)
		if err != nil {
			return errors.Wrap(err, "failed to fetch collection activity")
		}

		for _, activity := range collectionActivity.Collection.Activities {
			if err := srv.Send(&marketplacepb.CollectionActivityResponse{Activity: &marketplacepb.Activity{
				Id:              fmt.Sprintf("%s-%s", marketplacepb.Network_NETWORK_SOLANA.Prefix(), faker.UUIDDigit()),
				Amount:          activity.Price,
				Denom:           "lamports",
				TransactionKind: activity.ActivityType,
				TargetName:      activity.Nft.Name,
				TargetImageUri:  activity.Nft.Image,
				Time:            activity.CreatedAt,
			}}); err != nil {
				return errors.Wrap(err, "failed to send activity")
			}
		}

		return nil
	}

	var activities []*indexerdb.Activity
	if err := s.conf.IndexerDB.
		Preload("Listing").
		Preload("Trade").
		Joins("NFT").
		Order("Time DESC").
		Limit(int(limit)).
		Offset(int(offset)).
		Where("NFT__collection_id = ?", id).
		Find(&activities).Error; err != nil {
		return errors.Wrap(err, "failed to retrieve activities from db")
	}
	for _, activity := range activities {
		if activity.NFT == nil {
			s.conf.Logger.Error("missing NFT on activity")
			continue
		}
		var price, denom string
		switch activity.Kind {
		case indexerdb.ActivityKindTrade:
			if activity.Trade != nil {
				price = activity.Trade.Price
				denom = activity.Trade.PriceDenom
			}
		case indexerdb.ActivityKindList:
			if activity.Listing != nil {
				price = activity.Listing.Price
				denom = activity.Listing.PriceDenom
			}
		}
		if err := srv.Send(&marketplacepb.CollectionActivityResponse{Activity: &marketplacepb.Activity{
			Id:              activity.ID,
			TransactionKind: string(activity.Kind),
			TargetName:      activity.NFT.Name,
			TargetImageUri:  activity.NFT.ImageURI,
			ContractName:    "ToriVault",
			Time:            activity.Time.Format(time.RFC3339),
			Amount:          price,
			Denom:           denom,
		}}); err != nil {
			return errors.Wrap(err, "failed to send activity")
		}
	}

	return nil
}

func (s *MarkteplaceService) NFTActivity(req *marketplacepb.NFTActivityRequest, srv marketplacepb.MarketplaceService_NFTActivityServer) error {
	// TODO: we should use a time cursor based pagination instead of limit and offset

	limit := req.GetLimit()
	if limit <= 0 {
		return errors.New("limit must be a positive number")
	}

	offset := req.GetOffset()
	if offset < 0 {
		return errors.New("offset must be greater or equal to 0")
	}

	id := req.GetId()
	if id == "" {
		return errors.New("empty mint address")
	}

	if strings.HasPrefix(id, marketplacepb.Network_NETWORK_FAKE.Prefix()) {
		for i := int32(0); i < limit; i++ {
			if err := srv.Send(&marketplacepb.NFTActivityResponse{Activity: faking.FakeActivity()}); err != nil {
				return errors.Wrap(err, "failed to send activity")
			}
		}
		return nil
	}

	var activities []*indexerdb.Activity
	if err := s.conf.IndexerDB.
		Preload("Listing").
		Preload("Trade").
		Joins("NFT").
		Order("Time DESC").
		Limit(int(limit)).
		Offset(int(offset)).
		Where("NFT__id = ?", id).
		Find(&activities).Error; err != nil {
		return errors.Wrap(err, "failed to retrieve activities from db")
	}
	for _, activity := range activities {
		if activity.NFT == nil {
			s.conf.Logger.Error("missing NFT on activity")
			continue
		}
		var price, denom string
		switch activity.Kind {
		case indexerdb.ActivityKindTrade:
			if activity.Trade != nil {
				price = activity.Trade.Price
				denom = activity.Trade.PriceDenom
			}
		case indexerdb.ActivityKindList:
			if activity.Listing != nil {
				price = activity.Listing.Price
				denom = activity.Listing.PriceDenom
			}
		}
		if err := srv.Send(&marketplacepb.NFTActivityResponse{Activity: &marketplacepb.Activity{
			Id:              activity.ID,
			TransactionKind: string(activity.Kind),
			TargetName:      activity.NFT.Name,
			TargetImageUri:  activity.NFT.ImageURI,
			ContractName:    "ToriVault",
			Time:            activity.Time.Format(time.RFC3339),
			Amount:          price,
			Denom:           denom,
		}}); err != nil {
			return errors.Wrap(err, "failed to send activity")
		}
	}

	return nil
}

func (s *MarkteplaceService) NFTPriceHistory(ctx context.Context, req *marketplacepb.NFTPriceHistoryRequest) (*marketplacepb.NFTPriceHistoryResponse, error) {
	id := req.GetId()
	if id == "" {
		return nil, errors.New("empty id")
	}

	var data []*marketplacepb.PriceDatum

	// TODO: data decimation in case we have a lot of samples for the period

	if err := s.conf.IndexerDB.
		WithContext(ctx).
		Model(&indexerdb.Trade{}).
		Select("trades.price as price, activities.time as time").
		Joins("JOIN activities ON trades.activity_id = activities.id").
		Where("activities.time > ?", time.Now().AddDate(0, 0, -7)).
		Where("activities.nft_id = ?", id).
		Order("activities.time ASC").
		Scan(&data).Error; err != nil {
		return nil, errors.Wrap(err, "failed to retrieve data from db")
	}

	return &marketplacepb.NFTPriceHistoryResponse{Data: data}, nil
}

type QuestWithCompletion struct {
	ID        string
	Title     string
	Completed bool
}

func (s *MarkteplaceService) Quests(req *marketplacepb.QuestsRequest, srv marketplacepb.MarketplaceService_QuestsServer) error {
	var quests []QuestWithCompletion
	if err := s.conf.IndexerDB.
		WithContext(srv.Context()).
		Model(&indexerdb.Quest{}).
		Select("quests.id as id, quests.title as title, quest_completions.completed as completed").
		Joins("LEFT JOIN quest_completions ON quests.id = quest_completions.quest_id AND quest_completions.user_id = ?", req.GetUserId()).
		Limit(int(req.GetLimit())).
		Offset(int(req.GetOffset())).
		Scan(&quests).Error; err != nil {
		return errors.Wrap(err, "failed to query quests")
	}
	for _, q := range quests {
		if err := srv.Send(&marketplacepb.QuestsResponse{Quest: &marketplacepb.Quest{
			Id:        q.ID,
			Title:     q.Title,
			Completed: q.Completed,
		}}); err != nil {
			return errors.Wrap(err, "failed to send quest")
		}
	}
	return nil
}
