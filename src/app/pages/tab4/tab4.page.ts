import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Share } from '@capacitor/share';
import { ModalExampleComponent } from 'src/app/modal/modal-example.component';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss']
})
export class Tab4Page {
  noticias: any[] = [];

  constructor(
    private modalController: ModalController,
    private firestore: AngularFirestore
  ) {}

  async ngOnInit() {
    // Cargar las noticias guardadas desde Firebase Firestore
    this.firestore.collection<any>('Noticias').valueChanges().subscribe(noticias => {
      this.noticias = noticias;
    });
  }

  async openModal() {
    const modal = await this.modalController.create({
      component: ModalExampleComponent
    });
    await modal.present();
  
    const { data, role } = await modal.onDidDismiss();
    console.log(data);
    
    if (role === 'confirm') {
      // Agregar la noticia a la lista de noticias
      this.noticias.push(data);
  
      // Guardar la lista de noticias en Firestore
      await this.firestore.collection('Noticias').add(data);
    }
  }

  async compartirNoticia(noticia: any) {
    const { titulo, descripcion, foto } = noticia;

    // Compartir la noticia utilizando el complemento Share de Capacitor
    await Share.share({
      title: titulo,
      text: descripcion,
      url: foto, // Esto podría no ser necesario si la foto ya está disponible públicamente en Firebase Storage
      dialogTitle: 'Compartir noticia'
    });
  }

  async eliminarNoticia(noticia: any) {
    // Eliminar la noticia de la lista
    this.noticias = this.noticias.filter(item => item !== noticia);

    // Eliminar la noticia de Firebase Firestore
    const noticiasRef = this.firestore.collection('Noticias', ref => ref.where('titulo', '==', noticia.titulo).limit(1));
    noticiasRef.snapshotChanges().subscribe(actions => {
      actions.forEach(action => {
        const docId = action.payload.doc.id;
        noticiasRef.doc(docId).delete();
      });
    });
  }
}