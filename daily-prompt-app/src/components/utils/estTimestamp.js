import { Timestamp } from 'firebase/firestore';

/**
 * Creates a Firestore Timestamp in Eastern Standard Time (EST/EDT)
 * Automatically detects and adjusts for Daylight Saving Time
 * @returns {Timestamp} Firestore Timestamp in EST/EDT
 */
export const createESTTimestamp = () => {
  const now = new Date();
  
  // Check if it's Daylight Saving Time in EST
  const isDST = () => {
    // Rough implementation of DST detection for EST
    // DST starts on second Sunday in March and ends on first Sunday in November
    const year = now.getFullYear();
    const januaryOffset = new Date(year, 0, 1).getTimezoneOffset();
    const julyOffset = new Date(year, 6, 1).getTimezoneOffset();
    const stdTimezoneOffset = Math.max(januaryOffset, julyOffset);
    
    return now.getTimezoneOffset() < stdTimezoneOffset;
  };
  
  // Apply EST offset (UTC-5 or UTC-4 for DST)
  const offsetHours = isDST() ? 4 : 5; // 4 hours behind UTC during DST, 5 hours otherwise
  const utcMillis = now.getTime() + (now.getTimezoneOffset() * 60 * 1000); // Convert to UTC
  const estMillis = utcMillis - (offsetHours * 60 * 60 * 1000); // Apply EST offset
  
  // Create Firestore timestamp from EST time
  return Timestamp.fromMillis(estMillis);
};

export default createESTTimestamp;