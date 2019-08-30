'use strict'

Object.assign(Dom,{
  datesFields(my, form){
    var divCDate = this.createDiv({class:'row'})
    divCDate.append(this.create('LABEL',{for:my.prefix('created_at'), text:'Créée le (Mois/Jour/Année — défaut : maintenant)'}))
    divCDate.append(this.createInput({type:'text', id:my.prefix('created_at'), placeholder:'MM/JJ/AAAA', class:'medium'}))
    form.append(divCDate)

    var divMDate = this.createDiv({class:'row'})
    divMDate.append(this.create('LABEL',{for:my.prefix('updated_at'), text:'Modifié le (Mois/Jour/Année — défaut : maintenant)'}))
    divMDate.append(this.createInput({type:'text', id:my.prefix('updated_at'), placeholder:'MM/JJ/AAAA', class:'medium'}))
    form.append(divMDate)
  }
})
