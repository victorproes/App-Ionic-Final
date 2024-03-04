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
    await this.storage.create();
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async confirm() {
    const data = {
      titulo: this.titulo,
      descripcion: this.descripcion,
      foto: this.selectedPhoto
    };

    await this.storage.set('formData', data);
    return this.modalCtrl.dismiss(data, 'confirm');
  }

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });

    this.uploadImage(image);
  }

  async chooseFromGallery() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos
    });

    this.uploadImage(image);
  }

  async uploadImage(image: any) {
    const fileName = new Date().getTime() + '.jpg';
    const filePath = `noticias/${fileName}`;
    const fileRef = this.fireStorage.ref(filePath);
    const file = await this.fetchFile(image.webPath);

    const uploadTask = fileRef.put(file);

    uploadTask.snapshotChanges().pipe(
      finalize(async () => {
        this.selectedPhoto = await fileRef.getDownloadURL().toPromise();
      })
    ).subscribe();
  }

  async fetchFile(url: string): Promise<Blob> {
    const response = await fetch(url);
    return await response.blob();
  }
}
