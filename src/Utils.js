import $ from 'jquery'
// import moment from 'moment'

export async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}


export function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[[]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export function updateQueryStringParam (key, value) {
    var baseUrl = [window.location.protocol, '//', window.location.host, window.location.pathname].join(''),
        urlQueryString = document.location.search,
        newParam = key + '=' + value,
        params = '?' + newParam;

    // If the "search" string exists, then build params from it
    if (urlQueryString) {
        let keyRegex = new RegExp('([?&])' + key + '[^&]*');

        // If param exists already, update it
        if (urlQueryString.match(keyRegex) !== null) {
            params = urlQueryString.replace(keyRegex, "$1" + newParam);
        } else { // Otherwise, add it to end of query string
            params = urlQueryString + '&' + newParam;
        }
    }
    window.history.replaceState({}, "", baseUrl + params);
}

export function removeAcento (text) {       
    text = text.toLowerCase();                                                         
    text = text.replace(new RegExp('[ÁÀÂÃ]','gi'), 'a');
    text = text.replace(new RegExp('[ÉÈÊ]','gi'), 'e');
    text = text.replace(new RegExp('[ÍÌÎ]','gi'), 'i');
    text = text.replace(new RegExp('[ÓÒÔÕ]','gi'), 'o');
    text = text.replace(new RegExp('[ÚÙÛ]','gi'), 'u');
    text = text.replace(new RegExp('[Ç]','gi'), 'c');
    text = text.toUpperCase();
    return text;                 
}

export function now(aux) {
    let now = new Date ()
    now.setDate(now.getDate() + aux)
    let year = now.getFullYear()
    let month = now.getMonth()+1<10 ? '0'+now.getMonth()+1 : now.getMonth()+1
    let day = now.getDate()<10 ? '0'+now.getDate() : now.getDate()
    return year+'-'+month+'-'+day
}

export function date2str(data) {
    let date = new Date(data)
    let year = date.getFullYear()
    let month = date.getMonth()+1<10 ? '0'+date.getMonth()+1 : date.getMonth()+1
    let day = date.getDate()<10 ? '0'+date.getDate() : date.getDate()
    let hour = date.getHours()<10 ? '0'+date.getHours() : date.getHours()
    let min = date.getMinutes()<10 ? '0'+date.getMinutes() : date.getMinutes()
    return (day+'/'+month+'/'+year+' às '+hour+':'+min)
}

export function mascaraCNPJ(texto) {
    let cnpj = ''
    if (texto != null){
      cnpj=texto.substr(0,2)+'.'+texto.substr(2,3)+'.'+texto.substr(5,3)+'/'+texto.substr(8,4)+'-'+texto.substr(12,2)
    }
    return cnpj;  
}

export function garanteDate(texto) {
    let data = ''
    if (texto != null){
      data=texto.substr(8,2)+'/'+texto.substr(5,2)+'/'+texto.substr(0,4)
    }
    return data;
}

export function dateSql(texto, entre) {
    let data = ''
    if (texto != null){
      if (typeof entre !== 'undefined'){
        data=entre+texto.substr(0,4)+'-'+texto.substr(5,2)+'-'+texto.substr(8,2)+entre
      } else {
        data=texto.substr(0,4)+'-'+texto.substr(5,2)+'-'+texto.substr(8,2)
      }
    }
    return data;
}

export function zeraNull(texto) {
    let valor = 0
    if (texto === null) {
      valor = 0
    } else {
      valor = texto
    }
    return valor
}

export function populateForm(frm, data) {   
    $.each(data, function(key, value){  
        var $ctrl = $('[name='+key+']', frm); 
        if($ctrl.is('select')){
            $("option",$ctrl).each(function(){
                // eslint-disable-next-line
                if (this.value==value) { this.selected=true; }
            });
        }
        else {
            // eslint-disable-next-line
            switch($ctrl.attr("type"))  
            {  
                case "text" :   case "hidden":  case "textarea":  
                    $ctrl.val(value);   
                    break;   
                case "radio" : case "checkbox":   
                    $ctrl.each(function(){
                    // eslint-disable-next-line
                    if($(this).attr('value') == value) {  $(this).attr("checked",value); } });   
                    break;
            } 
        } 
    });  
};

export function validarCNPJ(cnpj) {
 
    cnpj = cnpj.replace(/[^\d]+/g,'');
    console.log('Etapa 1', cnpj)
 
    if(cnpj === '') return false;
     
    if (cnpj.length !== 14)
        return false;
 
    // Elimina CNPJs invalidos conhecidos
    if (cnpj === "00000000000000" || 
        cnpj === "11111111111111" || 
        cnpj === "22222222222222" || 
        cnpj === "33333333333333" || 
        cnpj === "44444444444444" || 
        cnpj === "55555555555555" || 
        cnpj === "66666666666666" || 
        cnpj === "77777777777777" || 
        cnpj === "88888888888888" || 
        cnpj === "99999999999999")
        return false;
         
    // Valida DVs
    var tamanho = cnpj.length - 2
    var numeros = cnpj.substring(0,tamanho);
    var digitos = cnpj.substring(tamanho);
    var soma = 0;
    var pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2)
            pos = 9;
    }
    var resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== Number(digitos.charAt(0)))
        return false;
         
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0,tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== Number(digitos.charAt(1)))
          return false;
           
    return true;
    
}