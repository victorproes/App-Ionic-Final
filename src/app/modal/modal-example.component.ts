import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CameraResultType, CameraSource, Camera } from '@capacitor/camera';
import { Storage } from '@ionic/storage-angular';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-modal-example',
  templateUrl: 'modal-example.component.html',
})
export class ModalExampleComponent {
  titulo: string | undefined;
  descripcion: string | undefined;
  selectedPhoto: string | undefined;

  constructor(
    private modalCtrl: ModalController,
    private storage: Storage,
    private fireStorage: AngularFireStorage
  ) {}

  async ngOnInit() {
    // Inicializa el almacenamiento local

    await this.storage.create();
  }

  // Cierra el modal sin retornar ningún valor
  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  // Confirma la acción y cierra el modal retornando los datos ingresados
  async confirm() {
    const data = {
      titulo: this.titulo,
      descripcion: this.descripcion,
      foto: this.selectedPhoto,
    };

    await this.storage.set('formData', data); // Guarda los datos en el almacenamiento local
    return this.modalCtrl.dismiss(data, 'confirm'); // Cierra el modal y retorna los datos
  }

  // Captura una foto utilizando la cámara
  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera, // Utiliza la cámara como fuente de la imagen
    });

    this.uploadImage(image); // Sube la imagen capturada
  }

  // Selecciona una foto desde la galería
  async chooseFromGallery() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos, // Utiliza la galería de fotos como fuente de la imagen
    });

    this.uploadImage(image); // Sube la imagen seleccionada
  }

  // Sube la imagen al almacenamiento de Firebase
  async uploadImage(image: any) {
    const fileName = new Date().getTime() + '.jpg'; // Genera un nombre de archivo único basado en la fecha
    const filePath = `noticias/${fileName}`; // Establece la ruta de almacenamiento en Firebase
    const fileRef = this.fireStorage.ref(filePath); // Obtiene una referencia al archivo en Firebase
    const file = await this.fetchFile(image.webPath); // Obtiene el archivo de la ruta local de la imagen

    const uploadTask = fileRef.put(file); // Sube el archivo a Firebase

    // Una vez completada la carga, obtiene la URL de descarga de la imagen y la asigna a selectedPhoto
    uploadTask
      .snapshotChanges()
      .pipe(
        finalize(async () => {
          this.selectedPhoto = await fileRef.getDownloadURL().toPromise();
        })
      )
      .subscribe();
  }

  // Convierte la ruta local de la imagen en un Blob para su posterior carga
  async fetchFile(url: string): Promise<Blob> {
    const response = await fetch(url); // Realiza una solicitud para obtener el Blob de la imagen
    return await response.blob(); // Retorna el Blob obtenido
  }
}
