import { useMemo } from "react";

interface UseStudioAssetImportModelOptions {
  fileInputRef: React.RefObject<HTMLInputElement>;
  onAudioUpload: React.ChangeEventHandler<HTMLInputElement>;
}

export function useStudioAssetImportModel({
  fileInputRef,
  onAudioUpload,
}: UseStudioAssetImportModelOptions) {
  return useMemo(
    () => ({
      fileInputRef,
      onAudioUpload,
      openAudioUpload: () => fileInputRef.current?.click(),
      inputProps: {
        ref: fileInputRef,
        type: "file" as const,
        accept: "audio/*",
        className: "hidden",
        onChange: onAudioUpload,
      },
    }),
    [fileInputRef, onAudioUpload],
  );
}
