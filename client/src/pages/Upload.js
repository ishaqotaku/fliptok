import React, { useState } from 'react';
import { uploadVideo } from '../services/api';
import './css/Upload.css';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState({
    title: '',
    publisher: '',
    producer: '',
    genre: 'General',
    ageRating: 'PG',
  });
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  const onChange = (e) => setMeta({ ...meta, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!file) {
      setMessage('Please select a video file');
      return;
    }

    const formData = new FormData();
    formData.append('video', file);
    Object.entries(meta).forEach(([k, v]) => formData.append(k, v));

    try {
      await uploadVideo(formData, (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded * 100) / evt.total));
      });
      setMessage('Upload successful!');
      setFile(null);
      setProgress(0);
    } catch (e) {
      console.error(e);
      setMessage('Upload failed');
    }
  };

  return (
    <div className="upload-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg p-4 border-0 upload-card">
              <div className="card-body">
                <h2 className="card-title text-center mb-4 fw-light">Upload Video</h2>
                <form onSubmit={onSubmit}>
                  {['title', 'publisher', 'producer', 'genre'].map((field) => (
                    <div className="mb-3" key={field}>
                      <label className="form-label">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name={field}
                        value={meta[field]}
                        onChange={onChange}
                        required
                      />
                    </div>
                  ))}
                  <div className="mb-3">
                    <label className="form-label">Age Rating</label>
                    <select
                      name="ageRating"
                      className="form-select"
                      value={meta.ageRating}
                      onChange={onChange}
                    >
                      {['U', 'PG', '12', '15', '18'].map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Video File</label>
                    <input
                      type="file"
                      accept="video/*"
                      className="form-control"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mt-4">
                    Upload
                  </button>
                </form>

                {progress > 0 && progress < 100 && (
                  <div className="progress mt-3">
                    <div
                      className="progress-bar bg-primary"
                      role="progressbar"
                      style={{ width: `${progress}%` }}
                      aria-valuenow={progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {progress}%
                    </div>
                  </div>
                )}
                {message && (
                  <div
                    className={`alert ${
                      message.includes('successful') ? 'alert-success' : 'alert-danger'
                    } mt-3`}
                  >
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}