export const formatTimestamp = (timestamp: any) => { // 'any' because it could be Timestamp or Date from JSON serialization
    let date;
    if (timestamp && typeof timestamp.toDate === 'function') { 
        date = timestamp.toDate();
    } else if (timestamp instanceof Date) { 
        date = timestamp;
    } else if (typeof timestamp === 'object' && timestamp.hasOwnProperty('_seconds') && timestamp.hasOwnProperty('_nanoseconds')) {
        date = new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
    }
        
    if (date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }
    return 'Just now';
};