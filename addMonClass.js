
class AddMonData{
   name = "" // use the option's value attribute
   fastMove = "" // use the option's value attribute
   chargeMove1 = "" // use the option's value attribute
   chargeMove2 = "" // use the option's value attribute
   ivAttack = 0;
   ivDefence = 0;
   ivHp = 0;
   
   constructor(name, fastMove, chargeMove1, chargeMove2, ivAttack, ivDefence, ivHp){
      this.name = name;
      this.fastMove = fastMove;
      this.chargeMove1 = chargeMove1;
      this.chargeMove2 = chargeMove2;
      this.ivAttack = ivAttack;
      this.ivDefence = ivDefence;
      this.ivHp = ivHp;
   }
   
}

module.exports = AddMonData