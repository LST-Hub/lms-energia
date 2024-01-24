import Dropzone from "react-dropzone";
import PropTypes from "prop-types";
import { forwardRef } from "react";
import Image from "next/image";

const TkDropzone = forwardRef(function TkDropzone(
  { onDrop, children, accept, multiple, maxSize, className, maxFiles, uploading, disabled, ...rest },
  ref
) {
  return (
    <Dropzone
      onDrop={onDrop}
      // accept={accept} // don't pass accept to accept all files
      multiple={multiple}
      // maxSize={maxSize}  // not passing max size as it dosent gives error on max size exceed, insted manually handel this in onDrop function
      className={className}
      disabled={disabled}
      // maxFiles={maxFiles} // handel maunally in onDrop function
      ref={ref}
      {...rest}
    >
      {({ getRootProps, getInputProps }) => (
        <div className="dropzone dz-clickable">
          {uploading ? (
            <h3 className="text-muted text-center mt-3">Uploading Files...</h3>
          ) : (
            <div className="dz-message needsclick" {...getRootProps()}>
              <input {...getInputProps()} />
              <svg width="100" height="100" viewBox="0 0 37 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M18.2432 0C15.444 0 12.6373 1.0579 10.5025 3.19257C8.84595 4.84918 7.85895 6.92191 7.48735 9.07095C3.24839 9.75945 0 13.4114 0 17.8378C0 22.754 4.00277 26.7568 8.91892 26.7568H13.3784C13.4858 26.7583 13.5925 26.7384 13.6922 26.6984C13.7919 26.6583 13.8826 26.5988 13.9592 26.5234C14.0357 26.4479 14.0964 26.358 14.1379 26.2589C14.1794 26.1598 14.2007 26.0534 14.2007 25.9459C14.2007 25.8385 14.1794 25.7321 14.1379 25.633C14.0964 25.5339 14.0357 25.444 13.9592 25.3685C13.8826 25.2931 13.7919 25.2336 13.6922 25.1935C13.5925 25.1535 13.4858 25.1336 13.3784 25.1351H8.91892C4.87918 25.1351 1.62162 21.8776 1.62162 17.8378C1.62162 14.0232 4.52785 10.9036 8.24749 10.5659C8.43274 10.5498 8.60683 10.4705 8.7406 10.3414C8.87437 10.2122 8.95968 10.041 8.98224 9.85642C9.2162 7.84145 10.0946 5.89351 11.6428 4.34544C13.466 2.52214 15.8548 1.62162 18.2432 1.62162C20.6317 1.62162 23.0066 2.52093 24.8311 4.34544C26.9398 6.45415 27.8202 9.31779 27.4916 12.0608C27.4771 12.1755 27.4874 12.2919 27.5216 12.4023C27.5558 12.5127 27.6132 12.6145 27.69 12.7008C27.7668 12.7872 27.8612 12.8562 27.9668 12.9031C28.0724 12.9501 28.1868 12.9739 28.3024 12.973H28.7838C32.1667 12.973 34.8649 15.6711 34.8649 19.0541C34.8649 22.437 32.1667 25.1351 28.7838 25.1351H23.1081C23.0007 25.1336 22.894 25.1535 22.7943 25.1935C22.6946 25.2336 22.6038 25.2931 22.5273 25.3685C22.4508 25.444 22.3901 25.5339 22.3486 25.633C22.3071 25.7321 22.2858 25.8385 22.2858 25.9459C22.2858 26.0534 22.3071 26.1598 22.3486 26.2589C22.3901 26.358 22.4508 26.4479 22.5273 26.5234C22.6038 26.5988 22.6946 26.6583 22.7943 26.6984C22.894 26.7384 23.0007 26.7583 23.1081 26.7568H28.7838C33.0371 26.7568 36.4865 23.3073 36.4865 19.0541C36.4865 14.9134 33.2107 11.5653 29.1132 11.3894C29.2318 8.43932 28.219 5.44031 25.9713 3.19257C23.8379 1.0591 21.0424 0 18.2432 0ZM18.2432 14.5946C18.0264 14.5986 17.8143 14.6912 17.6985 14.7973L13.239 18.8514C12.9058 19.1414 12.8896 19.6882 13.1757 20.0042C13.4618 20.3201 14.0138 20.3422 14.3286 20.0549L17.4324 17.2297V29.1892C17.4324 29.637 17.7954 30 18.2432 30C18.6911 30 19.0541 29.637 19.0541 29.1892V17.2297L22.1579 20.0549C22.4727 20.3422 23.0097 20.3059 23.3108 20.0042C23.623 19.6915 23.5647 19.136 23.2475 18.8514L18.788 14.7973C18.6095 14.6342 18.4584 14.5939 18.2432 14.5946Z"
                  fill="#0093FF"
                />
              </svg>
              {children}
              {Number(maxFiles) ? ( // 0 will not send this div, but we will not accept 0 files, insted we will disabale it in that case
                <div className="text-center  fs-6">
                  <small>Max {maxFiles} files are accepted at once.</small>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </Dropzone>
  );
});

TkDropzone.propTypes = {
  onDrop: PropTypes.func,
  accept: PropTypes.object,
  multiple: PropTypes.bool,
  maxSize: PropTypes.number,
  className: PropTypes.string,
  uploading: PropTypes.bool,
};

export default TkDropzone;
