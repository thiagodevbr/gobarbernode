import Sequelize, {
  Model
} from "sequelize";

class File extends Model {
  static init(sequelize) {
    //Chamando metodo init da classe pai (super) Model
    //Adicionar as colunas que serão populadas pelo usuario
    //Ignorar as colunas id, created_at...
    super.init({
      name: Sequelize.STRING,
      path: Sequelize.STRING,
      url: {
        type: Sequelize.VIRTUAL,
        get() {
          return `${process.env.APP_URL}files/${this.path}`
        }
      }
    }, {
      sequelize
    })
  }
}

export default File;