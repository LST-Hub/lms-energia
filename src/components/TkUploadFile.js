import PropTypes from "prop-types";
import { forwardRef, useState } from "react";
import { dropZone, MaxAttachmentSize } from "../utils/Constants";
import FormErrorText from "./forms/ErrorText";
import TkCard from "./TkCard";
import TkDropzone from "./TkDropzone";
import TkIcon from "./TkIcon";
import TkRow, { TkCol } from "./TkRow";
import { formatBytes } from "../utils/formatFileSize";

const TkUploadFiles = forwardRef(function UploadFiles(
  { onFilesDrop, children, multiple, maxFileSize, className, maxFiles, uploading, disabled, ...rest },
  ref
) {
  const [successFiles, setSuccessFiles] = useState([]);
  const [errorFiles, setErrorFiles] = useState([]);
  const [filesExcedded, setFilesExcedded] = useState(null);

  const handleAcceptedFiles = (files) => {
    if (!Array.isArray(files)) return;
    if (successFiles.length + files.length > maxFiles) {
      setFilesExcedded("Max 10 files are allowed at once.");
      setErrorFiles([]);
      return;
    }

    const success = [],
      error = [];
    //check for file size
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > Number(maxFileSize)) {
        error.push(files[i]);
      } else {
        success.push(files[i]);
      }
    }

    files.forEach((file) =>
      Object.assign(file, {
        formattedSize: formatBytes(file.size),
      })
    );
    const newFiles = [...successFiles, ...success];
    setFilesExcedded(null);
    setSuccessFiles(newFiles);
    setErrorFiles(error); // we leave previous error files and only show new error files

    if (onFilesDrop) onFilesDrop(newFiles, error);
  };

  //function to remove file from dropzone
  const removeFile = (file) => () => {
    const newFiles = [...successFiles];
    newFiles.splice(newFiles.indexOf(file), 1);
    setSuccessFiles(newFiles);
    if (onFilesDrop) onFilesDrop(newFiles);
  };

  return (
    <div className="mt-3">
      {/* TODO: see if drag and drop works on multiple os and browsers because it is giving me error while drap and drop */}
      {/* while selecting image files it crash saying widht of image is not defined */}
      <TkDropzone
        onDrop={(acceptedFiles) => {
          handleAcceptedFiles(acceptedFiles);
        }}
        multiple={multiple}
        className={className}
        uploading={uploading}
        maxFiles={maxFiles}
        disabled={disabled}
        ref={ref}
        {...rest}
      >
        {children}
      </TkDropzone>
      {filesExcedded ? <FormErrorText>{String(filesExcedded)}</FormErrorText> : null}

      <ul className="list-unstyled mb-0" id="dropzone-preview">
        {successFiles.map((f) => (
          <TkCard
            className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete"
            key={f.name + f.size}
          >
            <div className="p-2">
              <TkRow className="align-items-center">
                <TkCol xs={true} lg={11}>
                  <p className="text-muted font-weight-bold mb-0">{f.name}</p>
                  <p className="mb-0">
                    <strong>{f.formattedSize}</strong>
                  </p>
                </TkCol>
                <TkCol>
                  <TkIcon
                    className="ri-close-circle-line fs-4 text-muted hover-cursor"
                    onClick={removeFile(f)}
                  ></TkIcon>
                </TkCol>
              </TkRow>
            </div>
          </TkCard>
        ))}
        {errorFiles.map((f, i) => (
          <li key={f.name + f.size} className="mt-2">
            <div className="alert alert-warning alert-dismissible fade show" role="alert">
              <h5>File Size is greater than 25MB, Max file Size can be 25MB</h5>
              <h6>
                File Name: {f.name}, Size: {f.size}
              </h6>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
});

TkUploadFiles.propTypes = {
  onFilesDrop: PropTypes.func,
  accept: PropTypes.object,
  multiple: PropTypes.bool,
  maxFileSize: PropTypes.number,
  className: PropTypes.string,
  uploading: PropTypes.bool,
  disabled: PropTypes.bool,
  maxFiles: PropTypes.number,
};

TkUploadFiles.defaultProps = {
  maxFiles: dropZone.maxFiles,
  multiple: true,
  maxFileSize: MaxAttachmentSize,
};

export default TkUploadFiles;
