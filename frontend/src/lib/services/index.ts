/**
 * Service Index
 * Central export point for all services
 */

export { BaseService } from './base/BaseService';
export { MeetingService, meetingService } from './MeetingService';
export { AuthService, authService } from './AuthService';
export { ProjectService, projectService } from './ProjectService';
export { PeopleService, peopleService } from './PeopleService';

// Export service errors
export * from './base/ServiceError';

// Export service config types
export type { ServiceConfig, RequestConfig, ServiceMethodOptions } from './base/ServiceConfig';
