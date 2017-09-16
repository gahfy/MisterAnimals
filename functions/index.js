const functions = require('firebase-functions');
const ActionsSdkApp = require('actions-on-google').ActionsSdkApp;
const firebase = require('firebase');

var config = {
  apiKey: "AIzaSyB0ZrpLcf1CZFJi8isOASYnQv_9TBWrUn0",
  authDomain: "misteranimals-6d663.firebaseapp.com",
  databaseURL: "https://misteranimals-6d663.firebaseio.com",
  storageBucket: "misteranimals-6d663.appspot.com",
};
firebase.initializeApp(config);

const animals = [
    {
        name : "lièvre",
        female : "hase (qui s'écrit <say-as interpret-as=\"characters\">HASE</say-as>)",
        child : "levraut (qui s'écrit <say-as interpret-as=\"characters\">LEVRAUT</say-as>)",
        sound : {
            noun : "vagissement",
            verb : "vagit"
        }
    },
    {
        name : "cerf",
        female : "biche",
        child : "faon",
        sound : {
            noun : "brame",
            verb : "brame"
        }
    },
    {
        name : "canard",
        female : "cane",
        child : "caneton",
        sound : {
            noun : "cancan",
            verb : "cancane"
        }
    },
    {
        name : "porc",
        female : "truie",
        child : "porcelet",
        sound : {
            noun : "grognement",
            verb : "grogne"
        }
    },
    {
        name : "cheval",
        female : "jument",
        child : "poulain",
        sound : {
            noun : "hennissement",
            verb : "hennit"
        }
    },
    {
        name : "loup",
        female : "louve",
        child : "louveteau",
        sound : {
            noun : "hurlement",
            verb : "hurle"
        }
    },
    {
        name : "rat",
        female : "rate",
        child : "raton",
        sound : {
            noun : "jappement",
            verb : "jappe"
        }
    },
    {
        name : "singe",
        female : "guenon",
        child : null,
        sound : {
            noun : "cri",
            verb : "crie"
        }
    },
    {
        name : "taureau",
        female : "vache",
        child : "veau",
        sound : {
            noun : "meuglement",
            verb : "meugle"
        }
    },
    {
        name : "bouc",
        female : "chèvre",
        child : "chevreau",
        sound : {
            noun : "bêlement",
            verb : "bêle"
        }
    }
];

const getChild = function(animal){
    if(animal.child != null){
        return "<speak>Le petit du "+animal.name+" s'appelle le "+animal.child+"</speak>";
    }
    else{
        return "<speak>Il n'existe pas de nom en français pour désigner le petit du "+animal.name+"</speak>";
    }
};

const getFemale = function(animal){
    if(animal.female != null){
        return "<speak>La femelle du "+animal.name+" s'appelle la "+animal.female+"</speak>";
    }
    else{
        return "<speak>Il n'existe pas de nom en français pour désigner la femelle du "+animal.name+"</speak>";
    }
};

const getSound = function(animal){
    if(animal.sound != null){
        return "<speak>Le cri du "+animal.name+" est le "+animal.sound.noun+". On dit "
        +"que le "+animal.name+" "+animal.sound.verb+". Écoutons ce que ça donne : "+
        "<audio src=\"https://misteranimals-6d663.firebaseapp.com/sounds/"+animal.name+".wav\">"+animal.sound.noun+"</audio></speak>";
    }
    else{
        return "<speak>Il n'existe pas de nom en français pour désigner le cri du "+animal.name+"</speak>";
    }
}

const actions = [
    {
        name : [
            "petit", "fils", "enfant"
        ],
        action : getChild
    },
    {
        name : [
            "femme", "femelle"
        ],
        action : getFemale
    },
    {
        name : [
            "cri", "bruit", "son"
        ],
        action : getSound
    }
];

exports.animals = functions.https.onRequest((req, res) => {
    const app = new ActionsSdkApp({request: req, response: res});

    const mainIntent = function(app){
        app.ask("<speak>Très bien<break time=\"1s\" />, de quel animal souhaitez vous avoir plus d'informations ?</speak>");
    }

    const textIntent = function(app){
        var ref = firebase.database().ref("conversations-data/"+app.getConversationId()+"/")
        ref.once('value', function(snapshot) {
           if (snapshot.exists())
              respondToInformation(app, snapshot.val());
           else
              respondToAnimal(app);
        });
    }

    const respondToAnimal = function(app){
        animals.forEach(function(animal){
            if(app.getRawInput().indexOf(animal.name) !== -1){
                firebase.database().ref("conversations-data/"+app.getConversationId()+"/").set(animal);
                app.ask("<speak>Très bien<break time=\"1s\" />, souhaitez vous connaître le nom de la femelle, le cri, ou bien le nom du petit du "+animal.name+" ?</speak>");
                return;
            }
        });
        app.tell("<speak>Désolé, je n'ai pas compris votre demande. Peut-être que je ne connais pas encore cet animal.</speak>");
    }

    const respondToInformation = function(app, animal){
        // Nettoyage de la base de données
        firebase.database().ref("conversations-data/"+app.getConversationId()+"/").remove();
        actions.forEach(function(action){
            action.name.forEach(function(actionName){
                if(app.getRawInput().indexOf(actionName) !== -1){
                    app.tell(action.action(animal));
                }
            });
        });
        app.tell("<speak>Désolé, je n'ai pas compris votre demande. Peut-être que je ne connais pas cette information.</speak>");
    }

    let actionMap = new Map();
    actionMap.set(app.StandardIntents.MAIN, mainIntent);
    actionMap.set(app.StandardIntents.TEXT, textIntent);
    app.handleRequest(actionMap);
});
