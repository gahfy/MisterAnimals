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
        female : "hase",
        child : "levraut"
    },
    {
        name : "cerf",
        female : "biche",
        child : "faon"
    },
    {
        name : "canard",
        female : "cane",
        child : "caneton"
    },
    {
        name : "porc",
        female : "truie",
        child : "porcelet"
    },
    {
        name : "cheval",
        female : "jument",
        child : "poulain"
    },
    {
        name : "loup",
        female : "louve",
        child : "louveteau"
    },
    {
        name : "rat",
        female : "rate",
        child : "raton"
    },
    {
        name : "singe",
        female : "guenon",
        child : null
    },
    {
        name : "taureau",
        female : "vache",
        child : "veau"
    },
    {
        name : "bouc",
        female : "chèvre",
        child : "chevreau"
    }
];

const getChild = function(animal){
    if(animal.child != null){
        return "Le petit du "+animal.name+" s'appelle le "+animal.child;
    }
    else{
        return "Il n'existe pas de nom en français pour désigner le petit du "+animal.name;
    }
};

const getFemale = function(animal){
    if(animal.female != null){
        return "La femelle du "+animal.name+" s'appelle la "+animal.female;
    }
    else{
        return "Il n'existe pas de nom en français pour désigner la femelle du "+animal.name;
    }
};

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
    }
];

exports.animals = functions.https.onRequest((req, res) => {
    const app = new ActionsSdkApp({request: req, response: res});

    const mainIntent = function(app){
        app.ask("Très bien, de quel animal souhaitez vous avoir plus d'informations ?");
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
                app.ask("Très bien, souhaitez vous connaître le nom de la femelle, ou bien le nom du petit du "+animal.name+" ?");
                return;
            }
        });
        app.tell("Désolé, je n'ai pas compris votre demande. Peut-être que je ne connais pas encore cet animal.");
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
        app.tell("Désolé, je n'ai pas compris votre demande. Peut-être que je ne connais pas cette information.");
    }

    let actionMap = new Map();
    actionMap.set(app.StandardIntents.MAIN, mainIntent);
    actionMap.set(app.StandardIntents.TEXT, textIntent);
    app.handleRequest(actionMap);
});
