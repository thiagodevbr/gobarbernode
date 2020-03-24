import {
  Router
} from "express";
import UserController from "./app/controllers/UserController";
import SessionController from "./app/controllers/SessionController";
import AuthMiddleware from "./app/middlewares/auth"
import multer from 'multer'
import multerConfig from "./config/multer"
import FileController from "./app/controllers/FileController"
import ProviderController from "./app/controllers/ProviderController"
import AppointmentsController from "./app/controllers/AppointmentController"
import ScheduleController from "./app/controllers/ScheduleController"
import NotificationController from "./app/controllers/NotificationController"
import AvailableController from "./app/controllers/AvailableController";

const routes = new Router();
const upload = multer(multerConfig)

routes.post("/users", UserController.store);
routes.post("/sessions", SessionController.store);
routes.get("/users", UserController.getUsers);

routes.use(AuthMiddleware)
//Middlewarea vai funcionar para todos 
//as proximas rotas a partir daqui
routes.put("/user/update", UserController.update);
routes.post("/files", upload.single('file'), FileController.store)
routes.get('/providers', ProviderController.index)
routes.post('/appointments', AppointmentsController.store)
routes.get('/appointments', AppointmentsController.index)
routes.delete('/appointments/:id', AppointmentsController.delete)
routes.get('/provider', ScheduleController.index)
routes.get('/providers/:providerId/available', AvailableController.index)
routes.get('/notifications', NotificationController.index)
routes.put('/notifications/:id', NotificationController.update)



export default routes;