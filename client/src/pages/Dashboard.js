import React, { useEffect, useState } from 'react';
import { listVideos, addComment, addRating } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaArrowUp, FaArrowDown, FaComments } from 'react-icons/fa';
import './css/Dashboard.css';

export default function Dashboard() {
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user } = useAuth();

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data } = await listVideos();
      setVideos(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleNext = () => setCurrentIndex(prev => Math.min(prev + 1, videos.length - 1));
  const handlePrev = () => setCurrentIndex(prev => Math.max(prev - 1, 0));

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment) return;
    await addComment(videos[currentIndex].id, { text: comment });
    setComment('');
    fetchVideos();
  };

const submitRating = async (e) => {
  e.preventDefault();
  const videoId = videos[currentIndex].id;
  await addRating(videoId, { rating: Number(rating) });
  const { data } = await listVideos();
  const newVideos = data.items || [];
  const newIndex = newVideos.findIndex(v => v.id === videoId);
  setVideos(newVideos);
  setCurrentIndex(newIndex > -1 ? newIndex : 0);
};


  if (loading) return (
    <div className="dashboard-page d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-light" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  if (!videos.length) return <p className="text-center mt-5 text-light">No videos available.</p>;

  const video = videos[currentIndex];

  return (
    <div className="dashboard-page container-fluid vh-100 d-flex flex-column p-0">
      <div className="dashboard-row flex-grow-1">
        {/* Video Section */}
        <div className="video-section">
          <div className="video-wrapper">
            <video
              key={video.id}
              src={video.blobUrl}
              ref={el => { if (el) { el.muted = false; el.play().catch(() => {}); } }}
              autoPlay
              loop
              playsInline
              controls={false}
              className="dashboard-video"
            />
          </div>

          {/* Navigation Arrows */}
          <div className="video-nav">
            <button onClick={handlePrev} disabled={currentIndex === 0}><FaArrowUp /></button>
            <button onClick={handleNext} disabled={currentIndex >= videos.length - 1}><FaArrowDown /></button>
          </div>

          {/* Mobile floating button */}
          <button
            className="mobile-sidebar-btn d-md-none"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <FaComments />
          </button>
        </div>

        {/* Sidebar for desktop */}
        <div className="sidebar d-none d-md-flex flex-column">
          <SidebarContent
            video={video}
            user={user}
            comment={comment}
            setComment={setComment}
            rating={rating}
            setRating={setRating}
            submitComment={submitComment}
            submitRating={submitRating}
          />
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {mobileSidebarOpen && (
        <div className="mobile-sidebar-overlay d-md-none" onClick={() => setMobileSidebarOpen(false)}>
          <div className="mobile-sidebar" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setMobileSidebarOpen(false)}>×</button>
            <SidebarContent
              video={video}
              user={user}
              comment={comment}
              setComment={setComment}
              rating={rating}
              setRating={setRating}
              submitComment={submitComment}
              submitRating={submitRating}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarContent({ video, user, comment, setComment, rating, setRating, submitComment, submitRating }) {
  return (
    <div className="p-3 overflow-auto text-light">
      <h3 className="video-title">{video.title}</h3>
      <p className="text-light mb-1">{video.genre} • {video.ageRating} • {video.publisher}</p>
      <p><strong>⭐ {video.avgRating?.toFixed(1) ?? 'N/A'}</strong> ({video.ratings?.length || 0} ratings)</p>

      {user && (
        <div className="feedback mb-4">
          <h5>Leave Feedback</h5>
          <form onSubmit={submitComment} className="mb-3">
            <div className="input-group">
              <input
                className="form-control"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">Post</button>
            </div>
          </form>

          <form onSubmit={submitRating}>
            <div className="input-group">
              <select
                className="form-select"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
              </select>
              <button className="btn btn-outline-light" type="submit">Rate</button>
            </div>
          </form>
        </div>
      )}

      <div className="comments-section">
        <h5>Comments</h5>
        {video.comments?.length ? (
          <ul className="comments-list">
            {video.comments.map((c, idx) => (
              <li key={idx} className="comment-item">
                <div className="d-flex justify-content-between">
                  <strong>{c.userEmail || 'Anonymous'}</strong>
                  {c.sentiment && (
                    <span className={`badge sentiment-${c.sentiment || 'neutral'}`}>{c.sentiment}</span>
                  )}
                </div>
                <p>{c.text}</p>
              </li>
            ))}
          </ul>
        ) : <p className="text-light small">No comments yet.</p>}
      </div>
    </div>
  );
}