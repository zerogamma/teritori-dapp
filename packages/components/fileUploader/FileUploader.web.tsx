import React, { SyntheticEvent, useRef, useState } from "react";
import { TouchableOpacity, View } from "react-native";

import { FileUploaderProps } from "./FileUploader.type";
import { formatFile } from "./formatFile";
import gradientDottedCardSVG from "../../../assets/cards/gradient-dotted-card.svg";
import uploadSVG from "../../../assets/icons/upload.svg";
import { useFeedbacks } from "../../context/FeedbacksProvider";
import { neutral17, neutral77 } from "../../utils/style/colors";
import { fontSemibold14 } from "../../utils/style/fonts";
import { BrandText } from "../BrandText";
import { DeleteButton } from "../FilePreview/DeleteButton";
import { SVG } from "../SVG";
import { GradientText } from "../gradientText";
import { Label } from "../inputs/TextInputCustom";
const FILE_HEIGHT = 256;

export const FileUploader: React.FC<FileUploaderProps> = ({
  label,
  style,
  onUpload,
  // multiple is not used at true for now, needs to refactor in parents
  multiple,
  mimeTypes,
  children,
  maxUpload,
}) => {
  const { setToastError } = useFeedbacks();
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState("");

  const handleFiles = async (files: File[]) => {
    const _files = multiple ? files : [files[0]];
    let supportedFiles = [...files].filter((file) =>
      mimeTypes?.includes(file.type)
    );

    if (maxUpload && supportedFiles.length) {
      supportedFiles = supportedFiles.slice(0, maxUpload);
    }

    if (supportedFiles.length === 0) {
      setToastError({
        title: "Unsupported file type.",
        message: "Sorry we couldn't upload file.",
      });
      return;
    } else if (multiple && supportedFiles.length !== _files.length) {
      setToastError({
        title: "Unsupported file type.",
        message: "Sorry we couldn't upload some files at the moment.",
      });
    }
    if (!multiple) {
      setFile(URL.createObjectURL(_files[0]));
    }

    const formattedFiles = await Promise.all(
      supportedFiles.map(async (file) => await formatFile(file))
    );

    onUpload(formattedFiles);
  };

  const handleChange = (event: SyntheticEvent) => {
    const targetEvent = event.target as HTMLInputElement;
    if (targetEvent.files && targetEvent.files[0]) {
      handleFiles(targetEvent?.files as unknown as File[]);
    }
  };

  const handleClick = () => {
    hiddenFileInput?.current?.click?.();
  };

  const dropHandler = (ev: any) => {
    ev.preventDefault();

    if (ev.dataTransfer.items) {
      const files = [...ev.dataTransfer.items]
        .filter((item: any) => item.kind === "file")
        .map((item: any) => item.getAsFile());
      handleFiles(files);
    } else {
      handleFiles(ev.dataTransfer.files);
    }
  };

  const dragOverHandler = (ev: SyntheticEvent) => {
    ev.preventDefault();
  };

  const InputComponent = (
    <input
      type="file"
      ref={hiddenFileInput}
      style={{ display: "none", position: "absolute" }}
      onChange={handleChange}
      multiple={multiple}
      accept={mimeTypes?.join(",")}
    />
  );

  if (children) {
    return (
      <>
        {children({ onPress: handleClick })}
        {InputComponent}
      </>
    );
  }

  return (
    <>
      <View style={[style]}>
        {!!label && <Label style={{ marginBottom: 12 }}>{label}</Label>}
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            height: file ? FILE_HEIGHT : 80,
            borderRadius: 10,
          }}
        >
          {!file && (
            <SVG
              source={gradientDottedCardSVG}
              height={80}
              width="100%"
              style={{ position: "absolute" }}
            />
          )}

          {file ? (
            <div
              style={{
                height: "100%",
                width: "100%",
                justifyContent: "center",
                display: "flex",
              }}
            >
              <DeleteButton
                onPress={() => {
                  setFile("");
                  onUpload([]);
                }}
                style={{ top: 12, right: 12 }}
              />
              <img
                src={file}
                style={{
                  overflow: "hidden",
                  height: FILE_HEIGHT,
                  backgroundSize: "cover",
                }}
              />
            </div>
          ) : (
            <TouchableOpacity
              onPress={handleClick}
              style={{
                paddingVertical: 20,
                paddingHorizontal: 20,
                width: "100%",
                height: "100%",
              }}
            >
              <div
                onDrop={dropHandler}
                onDragOver={dragOverHandler}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <View
                  style={{
                    height: 40,
                    width: 40,
                    borderRadius: 24,
                    backgroundColor: neutral17,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 20,
                  }}
                >
                  <SVG source={uploadSVG} height={20} />
                </View>
                <View>
                  <GradientText gradientType="blueExtended">
                    Browse file
                  </GradientText>
                  <BrandText style={[fontSemibold14, { color: neutral77 }]}>
                    Or drag & drop here
                  </BrandText>
                </View>
                <input
                  type="file"
                  ref={hiddenFileInput}
                  style={{ display: "none", position: "absolute" }}
                  onChange={handleChange}
                  multiple={multiple}
                  accept={mimeTypes?.join(",")}
                />
              </div>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {InputComponent}
    </>
  );
};
