import { listInstances } from '../src/dashboard/instances';
import { getAllUsers } from '../src/dashboard/users';

console.log('Instancias activas:', listInstances());
console.log('Usuarios registrados:', getAllUsers().length);
