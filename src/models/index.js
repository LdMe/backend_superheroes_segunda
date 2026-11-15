import User from "./user.model.js";
import Hero from "./hero.model.js";
import Power from "./power.model.js";



User.hasMany(Hero,{ foreignKey: 'userId', as: 'heroes' });
Hero.belongsTo(User,{foreignKey: 'userId',as: 'owner'});

Hero.belongsToMany(Power, { through: "hero_powers", as: "powers", foreignKey: "heroId" });
Power.belongsToMany(Hero, { through: "hero_powers", as: "heroes", foreignKey: "powerId" });

export {
    User,
    Hero,
    Power
}