import { Place } from './Place';
import { User } from './User';

export class Schedule {
  public place: Place = new Place();
  public users: User[] = new Array<User>();
}
