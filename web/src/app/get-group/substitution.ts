export interface Substitution {
  id: number,
  hour: string,
  group: Array<String>,
  teacher_old: string,
  teacher_new: string,
  topic_old: string,
  room_old: string,
  topic_new: string,
  room_new: string,
  moved_from: string,
  info: string,
  cancelled: boolean,
  date: Date
}
