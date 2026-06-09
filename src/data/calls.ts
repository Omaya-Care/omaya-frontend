import { Call } from '../types';

export const calls: Call[] = [
  {
    id: '1',
    time: '09:00',
    motherId: '1',
    motherName: 'Abena Mansa',
    callType: 'Day 2 check-in',
    status: 'completed'
  },
  {
    id: '2',
    time: '10:30',
    motherId: '2',
    motherName: 'Ama Serwaa',
    callType: 'Day 6 check-in',
    status: 'in_progress'
  },
  {
    id: '3',
    time: '11:45',
    motherId: '4',
    motherName: 'Akosua Adjei',
    callType: 'Day 3 check-in',
    status: 'upcoming'
  },
  {
    id: '4',
    time: '13:00',
    motherId: '5',
    motherName: 'Esi Mensah',
    callType: 'Week 2 check-in',
    status: 'upcoming'
  },
  {
    id: '5',
    time: '08:15',
    motherId: '3',
    motherName: 'Gifty Osei',
    callType: 'Day 10 check-in',
    status: 'missed'
  },
  {
    id: '6',
    time: '14:30',
    motherId: '2',
    motherName: 'Ama Serwaa',
    callType: 'Follow-up',
    status: 'upcoming'
  }
];
