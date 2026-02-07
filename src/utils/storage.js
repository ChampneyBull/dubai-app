const STORAGE_KEY = 'dubai_app_data';

export const saveRequest = (request) => {
    const data = getAppData();
    data.requests.push({ ...request, id: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const approveRequest = (requestId) => {
    const data = getAppData();
    const requestIndex = data.requests.findIndex(r => r.id === requestId);
    if (requestIndex > -1) {
        const request = data.requests[requestIndex];
        request.status = 'approved';

        // Update golfer earnings
        const golfer = data.golfers.find(g => g.id === request.playerId);
        if (golfer) {
            golfer.earnings += request.amount;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
};

export const getAppData = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);

    // Default data
    return {
        requests: [],
        golfers: [] // Will be initialized from data.js
    };
};

export const initializeData = (initialGolfers) => {
    const data = getAppData();
    if (data.golfers.length === 0) {
        data.golfers = initialGolfers;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    return data;
};
