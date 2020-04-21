import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/database';
import { NavController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AngularFireStorage } from '@angular/fire/storage';
import { LoadingController } from '@ionic/angular';

import { ActionSheetController, Platform, AlertController } from '@ionic/angular';

declare var google;
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage  {
//objet agence
public agence =
 {
          nom: '',
          slogan: '',
          ref:'',
          photoo:''

};

//objet trajet

trajet = 
{
  debut: '',
  fin: '',
  dte:'',
  prix: '',
  nbre_place:'',
  adm:'',


};
//liste de couleur
public couleurs = ['danger','primary', 'secondary', 'tertiary', 'success', 'warning'  , 'medium', 'dark'];
public couleurs2 = ['dark', 'medium','warning', 'success','danger','primary', 'secondary', 'tertiary'];
i=-1;
j=-1; 

//liste de des objets
trajets=[];
users = [];
agences=[];
photo='';

  email ='';
  method: any;
  meth='password';
  source='';
  dest='';
  image = '';
  imagePath: string;
  upload: any;
  connected_=false;
  add_agence=false;
  add_Trajet=false;
  first_stape=true;

 @ViewChild('mapElement', { static: false }) mapNativeElement: ElementRef;
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  directionForm: FormGroup;
  constructor(
              private fb: FormBuilder,
              private navCtrl: NavController,
              public afDB: AngularFireDatabase,
              private route: ActivatedRoute,
              public afAuth: AngularFireAuth ,
              private camera: Camera,
              public loadingController: LoadingController,
              public alertController: AlertController,
              public afSG: AngularFireStorage
              
    ) 
    {

    this.email = route.snapshot.params['item'];
    this.method = route.snapshot.params['meth'];
    this.createDirectionForm();
    this.getMessages();
    this.getTrajets();
    this.getAgences();
    
  
}

  ngOnInit() {
  }

  async addPhoto(source: string) {
    if (source === 'camera') {
      console.log('camera');
      const cameraPhoto = await this.openCamera();
      this.image = 'data:image/jpg;base64,' + cameraPhoto;
    } else {
      console.log('library');
      const libraryImage = await this.openLibrary();
      this.image = 'data:image/jpg;base64,' + libraryImage;
    }
  }

async openLibrary() {
  const options: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    targetWidth: 1000,
    targetHeight: 1000,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
  };
  return await this.camera.getPicture(options);
}

async openCamera() {
  const options: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    targetWidth: 1000,
    targetHeight: 1000,
    sourceType: this.camera.PictureSourceType.CAMERA
  };
  return await this.camera.getPicture(options);
}

async uploadFirebase() {
	const loading = await this.loadingController.create({
		duration: 2000
	});
  await loading.present();
  this.imagePath = 'monDossier/' + new Date().getTime() + '.jpg';
  
	this.upload = this.afSG.ref(this.imagePath).putString(this.image, 'data_url');
	this.upload.then(async () => {
		await loading.onDidDismiss();
		this.image = '';
		const alert = await this.alertController.create({
			header: 'Félicitation',
			message: 'L\'envoi de la photo dans Firebase est terminé!',
			buttons: ['OK']
		});
		await alert.present();
	});
}


  accepte_Add_Agence(){
    this.add_agence=true;
   
   }
   accepte_trajet(){
    this.add_Trajet=true;
   
   }
   close_reservation(){
    this.first_stape=true;
    this.connected_=false;
   
   }

  createDirectionForm() {
    this.directionForm = this.fb.group({
      source: ['', Validators.required],
      destination: ['', Validators.required]
    });
  }

  ngAfterViewInit(): void {
   
    const map = new google.maps.Map(this.mapNativeElement.nativeElement, {
      zoom: 7,
      center: { lat:  4.061536, lng: 9.786072 }
    });
    this.directionsDisplay.setMap(map);
  
  }

  calculateAndDisplayRoute(formValues) {
    const that = this;
    this.directionsService.route({
      origin: this.source,
      destination: this.dest,
      travelMode: 'DRIVING'
    }, (response, status) => {
      if (status === 'OK') {
        that.directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  add() {
    this.afDB.list('User/').push({
      pseudo: 'drissas'
    });
  }

  logout() {
    this.afAuth.signOut();
    this.first_stape=false;
    this.connected_=true;
    this.trajet.debut='';
    this.trajet.fin='';
    this.trajet.dte='';
    this.trajet.prix='';
    this.trajet.nbre_place='';
    this.trajet.adm='';
    this.navCtrl.navigateForward(['/authentify']);
    
  
  }
  
 getMessages() {
	this.afDB.list('Users/').snapshotChanges(['child_added'])
	.subscribe(actions => {
		this.users = [];
		actions.forEach(action => {
			this.users.push({
				name: action.payload.exportVal().displayName,
        photo: action.payload.exportVal().photoURL,
        ide: action.payload.exportVal().ide
        
				
			});
		});
  });
  
}


add_Agence() {
  this.afDB.list('Agence/').push({
    nom: this.agence.nom,
    slogan:this.agence.slogan,
    adm:this.email,
    ref:this.imagePath 
  });
 // this.valide=false;
  this.agence.nom='';
  this.agence.slogan='';
  this.agence.photoo='';
  this.agence.ref='';
  this.add_agence=false;
}

add_trajets() {
  this.afDB.list('Trajets/').push({
    debut: this.trajet.debut,
    fin:this.trajet.fin,
    dte:this.trajet.dte,
    prix:this.trajet.prix,
    nbre_place:this.trajet.nbre_place,
    adm:this.email

  });
  this.add_Trajet=false;
  this.trajet.debut;
    this.trajet.fin='';
    this.trajet.dte='';
    this.trajet.prix='';
    this.trajet.nbre_place='';


}
/*
getImagesDatabase() {
  this.afDB.list('Agence/').snapshotChanges(['child_added']).subscribe(images => {
    images.forEach(image => {
      this.getImagesStorage(image);
    });
  });
}
getImagesStorage(image: any) {
  const imgRef = image.payload.exportVal().ref;
  this.afSG.ref(imgRef).getDownloadURL().subscribe(imgUrl => {
    console.log(imgUrl);
    this.images.push({
      name: image.payload.exportVal().name,
      url: imgUrl
    });
  });
}*/

getAgences() {
	this.afDB.list('Agence/').snapshotChanges(['child_added'])
	.subscribe(actions => {
		this.agences = [];
		actions.forEach(action => {
      const imgRef = action.payload.exportVal().ref;
      this.afSG.ref(imgRef).getDownloadURL().subscribe(imgUrl => {
        console.log(imgUrl);
        
			this.agences.push({

        nom: action.payload.exportVal().nom,
        slogan:action.payload.exportVal().slogan,
        adm: action.payload.exportVal().adm,
        ref:action.payload.exportVal().ref,
        photoo:imgUrl
      });


        
				
			});
		});
  });

 
  
}

getTrajets() {
	this.afDB.list('Trajets/').snapshotChanges(['child_added'])
	.subscribe(actions => {
		this.trajets = [];
    
		actions.forEach(action => {
			this.trajets.push({
  debut: action.payload.exportVal().debut,
  fin:action.payload.exportVal().fin,
  dte: action.payload.exportVal().dte,
  prix: action.payload.exportVal().prix,
  nbre_place:action.payload.exportVal().nbre_place,
  adm:action.payload.exportVal().adm,
  r:this.couleurs[this.i=this.i+1] ,
  r2:this.couleurs2[this.j=this.j+1] ,
  

				
			});
		}
);
	});
  this.i=-1;
  this.j=-1;
  
}

/*
public getUser(trajet):any 
{
  
  for (var i = 0; i < this.agences.length; i++)
   {
      if (this.agences[i].adm.toLowerCase() === trajet.adm.toLowerCase() ) {
     
        return this.agences[i];
    }
  }
  return null;
}

*/
affiche_trajet(trajet)
  {
    this.first_stape=false;
    this.connected_=true;
    this.trajet.debut=trajet.debut;
    this.trajet.fin=trajet.fin;
    this.trajet.dte=trajet.dte;
    this.trajet.prix=trajet.prix;
    this.trajet.nbre_place=trajet.nbre_place;
    this.trajet.adm=this.email;
    this.source=trajet.debut;
    this.dest=trajet.fin;
    

}

}
