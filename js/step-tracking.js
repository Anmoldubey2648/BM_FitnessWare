class StepTracker {
    constructor() {
        this.steps = 0;
        this.isTracking = false;
        this.watchId = null;
        this.lastPosition = null;
        this.stepTarget = 10000;
        this.userWeight = 70; // Default weight in kg
        this.userHeight = 170; // Default height in cm
        this.lastUpdateTime = null;
        this.minStepInterval = 1000; // Minimum time between step updates (1 second)
        this.stepLength = 0.7; // Average step length in meters
        this.initializeUI();
    }

    async initializeUI() {
        const startButton = document.getElementById('start-tracking');
        if (startButton) {
            startButton.addEventListener('click', () => this.toggleTracking());
        }

        const targetInput = document.getElementById('step-target');
        if (targetInput) {
            targetInput.addEventListener('change', (e) => this.setStepTarget(e.target.value));
        }

        // Request location permission
        await this.requestLocationPermission();
    }

    async requestLocationPermission() {
        try {
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            if (permission.state === 'granted') {
                console.log('Location permission granted');
            } else {
                console.log('Location permission not granted');
            }
        } catch (error) {
            console.error('Error requesting location permission:', error);
        }
    }

    toggleTracking() {
        if (this.isTracking) {
            this.stopTracking();
        } else {
            this.startTracking();
        }
    }

    startTracking() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        this.isTracking = true;
        this.lastUpdateTime = Date.now();
        
        this.watchId = navigator.geolocation.watchPosition(
            this.handlePosition.bind(this),
            this.handleError.bind(this),
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );

        this.updateUI();
        this.showNotification('Step tracking started');
    }

    stopTracking() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        this.isTracking = false;
        this.updateUI();
        this.showNotification('Step tracking stopped');
    }

    handlePosition(position) {
        const currentTime = Date.now();
        if (currentTime - this.lastUpdateTime < this.minStepInterval) {
            return; // Ignore updates too close together
        }

        if (this.lastPosition) {
            const distance = this.calculateDistance(
                this.lastPosition.coords.latitude,
                this.lastPosition.coords.longitude,
                position.coords.latitude,
                position.coords.longitude
            );
            
            // Only count steps if the distance is significant enough
            if (distance > 0.5) { // Minimum 0.5 meters
                const estimatedSteps = Math.round(distance / this.stepLength);
                this.steps += estimatedSteps;
                this.lastUpdateTime = currentTime;
                this.updateUI();
            }
        }
        
        this.lastPosition = position;
    }

    handleError(error) {
        console.error('Error getting location:', error);
        this.stopTracking();
        this.showNotification('Error tracking location. Please check your location settings.');
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI/180;
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lon2-lon1) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c; // Distance in meters
    }

    calculateCaloriesBurned() {
        // More accurate calorie calculation based on steps, weight, and height
        const MET = 3.5; // Metabolic equivalent of task for walking
        const timeInHours = this.steps * this.stepLength / 5000; // Assuming 5km/h walking speed
        const caloriesPerHour = MET * this.userWeight;
        return Math.round(caloriesPerHour * timeInHours);
    }

    setStepTarget(target) {
        this.stepTarget = parseInt(target);
        this.updateUI();
        this.showNotification(`Step target set to ${target}`);
    }

    setUserMetrics(weight, height) {
        this.userWeight = weight;
        this.userHeight = height;
        this.updateUI();
    }

    updateUI() {
        const stepsElement = document.getElementById('current-steps');
        const caloriesElement = document.getElementById('calories-burned');
        const targetElement = document.getElementById('step-target');
        const startButton = document.getElementById('start-tracking');

        if (stepsElement) {
            stepsElement.textContent = this.steps;
            // Add progress bar effect
            const progress = Math.min((this.steps / this.stepTarget) * 100, 100);
            stepsElement.style.background = `linear-gradient(90deg, #4CAF50 ${progress}%, #333 ${progress}%)`;
            stepsElement.style.webkitBackgroundClip = 'text';
            stepsElement.style.webkitTextFillColor = 'transparent';
        }

        if (caloriesElement) {
            caloriesElement.textContent = this.calculateCaloriesBurned();
        }

        if (targetElement) {
            targetElement.value = this.stepTarget;
        }

        if (startButton) {
            startButton.textContent = this.isTracking ? 'Stop Tracking' : 'Start Tracking';
            startButton.className = `p-2 rounded px-8 ${this.isTracking ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} transition-colors duration-300`;
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 translate-y-0 opacity-100';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateY(100%)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    reset() {
        this.steps = 0;
        this.stopTracking();
        this.updateUI();
        this.showNotification('Step count reset');
    }
}

// Initialize step tracker
const stepTracker = new StepTracker(); 