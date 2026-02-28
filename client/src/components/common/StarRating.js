import { FiStar } from 'react-icons/fi';

const StarRating = ({ rating, onRate, interactive = false }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={`star ${star <= rating ? 'star-filled' : ''}`}
          onClick={() => interactive && onRate && onRate(star)}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />
      ))}
      {!interactive && <span className="rating-text">{rating?.toFixed(1)}</span>}
    </div>
  );
};

export default StarRating;
