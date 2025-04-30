// Workout video handling
class WorkoutManager {
    constructor() {
        this.videos = [];
        this.currentUser = 'Anonymous User';
        this.currentVideoId = null;
        this.initializeUI();
    }

    initializeUI() {
        const workoutForm = document.getElementById('workout-upload-form');
        const bodyAnalysisForm = document.getElementById('body-analysis-form');

        if (workoutForm) {
            workoutForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(workoutForm);
                const videoData = {
                    title: formData.get('title'),
                    description: formData.get('description'),
                    file: formData.get('video'),
                    hashtags: formData.get('hashtags').split(' ').filter(tag => tag.startsWith('#'))
                };
                await this.uploadVideo(videoData);
                workoutForm.reset();
            });
        }

        if (bodyAnalysisForm) {
            bodyAnalysisForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(bodyAnalysisForm);
                const imageFile = formData.get('photo');
                await bodyAnalysis.analyzeImage(imageFile);
                bodyAnalysisForm.reset();
            });
        }

        // Add click handler for workout tips menu item
        const workoutTipsLink = document.querySelector('a[href="#workout-tips"]');
        if (workoutTipsLink) {
            workoutTipsLink.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('workout-tips').scrollIntoView({ behavior: 'smooth' });
            });
        }
    }

    async uploadVideo(videoData) {
        try {
            if (!videoData.file || !videoData.title || !videoData.description) {
                throw new Error('Please fill in all fields');
            }

            // Validate video file
            if (!videoData.file.type.startsWith('video/')) {
                throw new Error('Please upload a valid video file');
            }

            // Create video object
            const video = {
                id: Date.now(),
                title: videoData.title,
                description: videoData.description,
                url: URL.createObjectURL(videoData.file),
                uploader: this.currentUser,
                timestamp: new Date(),
                likes: 0,
                comments: [],
                hashtags: videoData.hashtags,
                thumbnail: await this.generateThumbnail(videoData.file)
            };
            
            this.videos.unshift(video);
            this.displayVideos();
            this.showNotification('Video uploaded successfully!');
            return video;
        } catch (error) {
            console.error('Error uploading video:', error);
            this.showNotification(error.message, 'error');
            throw error;
        }
    }

    generateThumbnail(videoFile) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(videoFile);
            video.onloadeddata = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);
                resolve(canvas.toDataURL('image/jpeg'));
                URL.revokeObjectURL(video.src);
            };
        });
    }

    displayVideos() {
        const container = document.getElementById('workout-videos');
        if (!container) return;

        if (this.videos.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-400 text-lg">No videos uploaded yet. Be the first to share your workout!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.videos.map(video => `
            <div class="video-card bg-gray-700 rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 cursor-pointer"
                 onclick="workoutManager.openVideoModal(${video.id})">
                <div class="relative">
                    <video class="w-full aspect-video object-cover" poster="${video.thumbnail}">
                        <source src="${video.url}" type="video/mp4">
                    </video>
                    <div class="absolute top-2 right-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                        ${this.formatDate(video.timestamp)}
                    </div>
                </div>
                <div class="p-4">
                    <h3 class="text-xl font-bold text-green-400">${video.title}</h3>
                    <p class="text-gray-300 line-clamp-2">${video.description}</p>
                    <div class="flex items-center justify-between mt-4">
                        <div class="flex items-center space-x-2">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(video.uploader)}" 
                                 alt="${video.uploader}" 
                                 class="w-8 h-8 rounded-full">
                            <span class="text-sm text-gray-400">${video.uploader}</span>
                        </div>
                        <div class="flex items-center space-x-4">
                            <span class="text-sm text-gray-400">
                                <i class="fas fa-heart"></i> ${video.likes}
                            </span>
                            <span class="text-sm text-gray-400">
                                <i class="fas fa-comment"></i> ${video.comments.length}
                            </span>
                        </div>
                    </div>
                    <div class="mt-2 flex flex-wrap gap-2">
                        ${video.hashtags.map(tag => `
                            <span class="text-sm text-blue-400">${tag}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    openVideoModal(videoId) {
        const video = this.videos.find(v => v.id === videoId);
        if (!video) return;

        this.currentVideoId = videoId;
        const modal = document.getElementById('video-modal');
        const modalVideo = document.getElementById('modal-video');
        const modalTitle = document.getElementById('modal-title');
        const modalDescription = document.getElementById('modal-description');
        const modalUploader = document.getElementById('modal-uploader');
        const modalDate = document.getElementById('modal-date');
        const modalAvatar = document.getElementById('modal-avatar');
        const modalLikes = document.getElementById('modal-likes');
        const modalCommentCount = document.getElementById('modal-comment-count');
        const modalComments = document.getElementById('modal-comments');
        const modalHashtags = document.getElementById('modal-hashtags');

        modalVideo.src = video.url;
        modalTitle.textContent = video.title;
        modalDescription.textContent = video.description;
        modalUploader.textContent = video.uploader;
        modalDate.textContent = this.formatDate(video.timestamp);
        modalAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(video.uploader)}`;
        modalLikes.textContent = video.likes;
        modalCommentCount.textContent = video.comments.length;
        modalHashtags.innerHTML = video.hashtags.map(tag => `
            <span class="text-sm text-blue-400">${tag}</span>
        `).join('');
        modalComments.innerHTML = video.comments.map(comment => `
            <div class="bg-gray-700 p-2 rounded">
                <p class="text-sm text-gray-300">${comment}</p>
            </div>
        `).join('');

        modal.classList.remove('hidden');
        modalVideo.play();
    }

    closeVideoModal() {
        const modal = document.getElementById('video-modal');
        const modalVideo = document.getElementById('modal-video');
        modalVideo.pause();
        modal.classList.add('hidden');
        this.currentVideoId = null;
    }

    likeVideoInModal() {
        if (!this.currentVideoId) return;
        const video = this.videos.find(v => v.id === this.currentVideoId);
        if (video) {
            video.likes++;
            document.getElementById('modal-likes').textContent = video.likes;
            this.displayVideos();
            this.showNotification('Liked video!');
        }
    }

    addCommentInModal() {
        if (!this.currentVideoId) return;
        const commentInput = document.getElementById('modal-comment-input');
        const comment = commentInput.value.trim();
        if (!comment) return;

        const video = this.videos.find(v => v.id === this.currentVideoId);
        if (video) {
            video.comments.push(comment);
            document.getElementById('modal-comment-count').textContent = video.comments.length;
            document.getElementById('modal-comments').innerHTML += `
                <div class="bg-gray-700 p-2 rounded">
                    <p class="text-sm text-gray-300">${comment}</p>
                </div>
            `;
            commentInput.value = '';
            this.displayVideos();
            this.showNotification('Comment added!');
        }
    }

    focusCommentInput() {
        document.getElementById('modal-comment-input').focus();
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 translate-y-0 opacity-100 ${
            type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateY(100%)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Global functions for modal interactions
function closeVideoModal() {
    workoutManager.closeVideoModal();
}

function likeVideoInModal() {
    workoutManager.likeVideoInModal();
}

function addCommentInModal() {
    workoutManager.addCommentInModal();
}

function focusCommentInput() {
    workoutManager.focusCommentInput();
}

// Body analysis handling
class BodyAnalysis {
    constructor() {
        this.analysisResults = {};
    }

    async analyzeImage(imageFile) {
        try {
            if (!imageFile) {
                throw new Error('Please select an image file');
            }

            // Validate image file
            if (!imageFile.type.startsWith('image/')) {
                throw new Error('Please upload a valid image file');
            }

            // Show loading state
            this.showLoading();

            // In a real app, this would send the image to an AI service
            // For now, we'll simulate an analysis with more realistic data
            const analysis = {
                bodyFat: Math.floor(Math.random() * 10) + 10,
                muscleMass: Math.floor(Math.random() * 10) + 40,
                recommendations: this.generateRecommendations()
            };

            this.analysisResults = analysis;
            this.displayAnalysis();
            this.showNotification('Analysis complete!');
            return analysis;
        } catch (error) {
            console.error('Error analyzing image:', error);
            this.showNotification(error.message, 'error');
            throw error;
        }
    }

    generateRecommendations() {
        const recommendations = [
            'Consider increasing protein intake',
            'Focus on strength training exercises',
            'Stay hydrated throughout the day',
            'Get adequate sleep (7-9 hours)',
            'Include cardio in your routine',
            'Practice proper form during exercises'
        ];
        return recommendations.sort(() => Math.random() - 0.5).slice(0, 3);
    }

    showLoading() {
        const container = document.getElementById('analysis-content');
        if (!container) return;

        container.innerHTML = `
            <div class="flex items-center justify-center space-x-2">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <span>Analyzing image...</span>
            </div>
        `;
    }

    displayAnalysis() {
        const container = document.getElementById('analysis-content');
        if (!container) return;

        container.innerHTML = `
            <div class="analysis-results space-y-4">
                <h4 class="text-xl font-bold mb-2 text-green-400">Analysis Results</h4>
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gray-700 p-4 rounded-lg">
                        <p class="font-bold text-gray-300">Body Fat Percentage:</p>
                        <p class="text-2xl text-green-400">${this.analysisResults.bodyFat}%</p>
                    </div>
                    <div class="bg-gray-700 p-4 rounded-lg">
                        <p class="font-bold text-gray-300">Muscle Mass:</p>
                        <p class="text-2xl text-green-400">${this.analysisResults.muscleMass}%</p>
                    </div>
                </div>
                <div class="mt-4">
                    <h5 class="font-bold text-gray-300">Recommendations:</h5>
                    <ul class="list-disc list-inside space-y-2 mt-2">
                        ${this.analysisResults.recommendations.map(rec => 
                            `<li class="text-gray-300">${rec}</li>`
                        ).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 translate-y-0 opacity-100 ${
            type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateY(100%)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize managers
const workoutManager = new WorkoutManager();
const bodyAnalysis = new BodyAnalysis(); 