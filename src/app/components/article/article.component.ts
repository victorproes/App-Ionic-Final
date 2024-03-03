import { Component, Input, OnInit } from '@angular/core';
import { Article } from 'src/app/interfaces';
import { Platform, ActionSheetButton, ActionSheetController } from '@ionic/angular';
import { Share } from '@capacitor/share';
import { Storage } from '@ionic/storage-angular';
import { AppEventService } from 'src/app/services/app-event.service';


@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
})
export class ArticleComponent implements OnInit {

  @Input() article!: Article;
  @Input() index!: number;
  isFavorite: boolean = false;



  constructor(private platform: Platform, private actionSheetCtrl: ActionSheetController, private storage: Storage, private appEventService: AppEventService) { }

  ngOnInit() {
    // Inicializa el almacenamiento local y carga el estado de favorito
    this.initializeStorage();
    this.loadFavoriteStatus();

  }

  private async initializeStorage() {
    // Inicializa el almacenamiento local
    await this.storage.create();
  }

  private async loadFavoriteStatus() {
    // Carga el estado de favorito

    this.isFavorite = await this.isArticleFavorite();

  }


    // Abre el enlace del artículo en una nueva ventana de ordenador o de movil
  openArticle() {
    if (this.platform.is('capacitor')) {
      window.open(this.article.url, '_system');
    } else {
      window.open(this.article.url, '_blank');
    }
  }

    // Abre un menú de acciones con opciones como agregar/quitar de favoritos , compartir o cancelar
  async onOpenMenu() {
    const normalBtns: ActionSheetButton[] = [
      {
        text: this.isFavorite ? 'Quitar de Favoritos' : 'Agregar a Favoritos',
        icon: this.isFavorite ? 'heart' : 'heart-outline',
        handler: () => this.onToggleFavorite(),
      },
      {
        text: 'Cancelar',
        icon: 'close-outline',
        role: 'cancel',
        cssClass: 'secondary',
      },
      {
        text: 'Compartir',
        icon: 'share-social-outline',
        handler: () => this.onShareArticle(),
      }
    ];

    const shareBtn: ActionSheetButton = {
      text: 'Compartir',
      icon: 'share-outline',
      handler: () => this.onShareArticle(),
    };

        // Agrega la opción de compartir solo si la plataforma es Capacitor
    if (this.platform.is('capacitor')) {
      normalBtns;
    }

        // Crea y presenta el Action Sheet
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: normalBtns,
    });

    await actionSheet.present();
  }

    // Comparte el artículo utilizando el Capacitor Share
  onShareArticle() {
    const { title, url } = this.article;
    Share.share({
      title,
      url,
    });
  }

    // Alterna entre agregar y quitar un artículo de la lista de favoritos
  async onToggleFavorite() {
    const isFavorite = await this.isArticleFavorite();

    if (isFavorite) {
      await this.removeArticleFromFavorites();
    } else {
      await this.addArticleToFavorites();
    }

    // Después de agregar o eliminar, vuelve a cargar los favoritos
    await this.getFavoriteArticles();
    await this.loadFavoriteStatus(); // Actualiza el estado de favorito

        // hace un evento para informar de un cambio en los artículos favoritos
    this.appEventService.triggerArticleChange();


  }


    // comprueba si el artículo actual ya está marcado como favorito
  private async isArticleFavorite(): Promise<boolean> {
    const favoriteArticles = await this.getFavoriteArticles();
    return favoriteArticles.some((favArticle: Article) => favArticle.title === this.article.title);
  }

    // Obtiene la lista de artículos favoritos desde el almacenamiento local
  private async getFavoriteArticles(): Promise<Article[]> {
    const result = await this.storage.get('favoriteArticles');
    return result ? JSON.parse(result) : [];
  }


    // Agrega el artículo actual a la lista de favoritos
  private async addArticleToFavorites() {
    const favoriteArticles = await this.getFavoriteArticles();
    favoriteArticles.push(this.article);
    await this.storage.set('favoriteArticles', JSON.stringify(favoriteArticles));

    // console.log('añadido a favoritos:', this.article);
    // console.log('Favoritos despues de añadirlo:', favoriteArticles);
  }

  // Elimina el artículo actual de la lista de favoritos
  private async removeArticleFromFavorites() {
    const favoriteArticles = await this.getFavoriteArticles();
    const updatedFavorites = favoriteArticles.filter((favArticle: Article) => favArticle.title !== this.article.title);
    await this.storage.set('favoriteArticles', JSON.stringify(updatedFavorites));

    // console.log('borrado de favoritos:', this.article);
    // console.log('articulos de favoritos despues de eliminarlo:', updatedFavorites);
  }
}
