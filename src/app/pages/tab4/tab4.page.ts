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
    // Se suscribe a los cambios en la colección de noticias y actualiza la lista de noticias
    this.firestore.collection<any>('Noticias').valueChanges().subscribe(noticias => {
      this.noticias = noticias;
    });
  }

  async openModal() {
    // Abre un modal para agregar una nueva noticia
    const modal = await this.modalController.create({
      component: ModalExampleComponent
    });
    await modal.present();
  
    // Espera hasta que el modal se cierre y recibe los datos de retorno
    const { data, role } = await modal.onDidDismiss();
    console.log(data);
    
    if (role === 'confirm') {
      // Si el usuario confirma, agrega la noticia a la lista de noticias
      this.noticias.push(data);
  
      // Guarda la nueva noticia en Firebase Firestore
      await this.firestore.collection('Noticias').add(data);
    }
  }

  async compartirNoticia(noticia: any) {
    const { titulo, descripcion, foto } = noticia;

    // Construye el mensaje con el título y la descripción de la noticia
    const mensaje = `${titulo}\n${descripcion}`;

    // Opciones para compartir que incluyen el mensaje y la foto como archivo adjunto
    const opciones = {
      title: 'Compartir noticia',
      text: mensaje,
      files: [foto], // Se pasa la foto como archivo para compartir
      dialogTitle: 'Compartir noticia'
    };

    console.log(opciones);

    // Comparte la noticia utilizando las opciones especificadas
    await Share.share(opciones);
  }

  async eliminarNoticia(noticia: any) {
    // Elimina la noticia de la lista de noticias
    this.noticias = this.noticias.filter(item => item !== noticia);

    // Elimina la noticia de Firebase Firestore
    const noticiasRef = this.firestore.collection('Noticias', ref => ref.where('titulo', '==', noticia.titulo).limit(1));
    noticiasRef.snapshotChanges().subscribe(actions => {
      actions.forEach(action => {
        const docId = action.payload.doc.id;
        noticiasRef.doc(docId).delete();
      });
    });
  }
}
