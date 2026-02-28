const LoadingSpinner = ({ size = 'medium' }) => {
  return (
    <div className={`loading-container`}>
      <div className={`spinner spinner-${size}`} />
    </div>
  );
};

export default LoadingSpinner;
