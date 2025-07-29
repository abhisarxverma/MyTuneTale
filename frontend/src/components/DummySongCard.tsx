import React from "react";
import "./DummySongCard.css";

type SongCardProps = {
  name: string | undefined;
  artist: string | undefined;
  album: string | undefined;
  imageUrl: string | undefined;
  position?: number | undefined;
};

const DummySongCard: React.FC<SongCardProps> = ({
  name,
  artist,
  album,
  imageUrl,
  position,
}) => {
  return (
    <div className="song-card">
      {position !== undefined && (
        <span className="song-position">{position}</span>
      )}
      <div className="song-details">
        <img src={imageUrl} alt={`${name} cover`} className="song-image" />
        <div className="song-text">
          <h3 className="song-name">{name}</h3>
          <p className="song-artist">{artist}</p>
          <p className="song-album">{album}</p>
        </div>
      </div>
    </div>
  );
};

export default DummySongCard;
