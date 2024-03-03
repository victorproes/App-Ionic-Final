import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Article } from 'src/app/interfaces';
import { AppEventService } from 'src/app/services/app-event.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  // Arreglo para almacenar los artículos favoritos
  favoriteArticles: Article[] = [];

  constructor(private storage: Storage, private appEventService: AppEventService) {}

  async ngOnInit() {
    console.log('Tab3Page ngOnInit called');

    // Inicializa el almacenamiento local
    await this.storage.create();

    // Suscribe el método loadFavoriteArticles al evento articleChanged
    this.appEventService.articleChanged.subscribe(() => {
      this.loadFavoriteArticles();
    });

    // Carga los artículos favoritos al inicializar el componente
    this.loadFavoriteArticles();
    
  }

  // Método para cargar los artículos favoritos desde el almacenamiento local
  async loadFavoriteArticles() {
    console.log('Loading favorite articles...');
    // Obtiene los artículos favoritos almacenados en el almacenamiento local
    const storedFavoriteArticles = await this.storage.get('favoriteArticles');
  
    try {
      // Intenta analizar los artículos favoritos almacenados
      const parsedFavoriteArticles = JSON.parse(storedFavoriteArticles);
      // Verifica si los artículos son un arreglo
      if (Array.isArray(parsedFavoriteArticles)) {
        this.favoriteArticles = parsedFavoriteArticles;
        console.log('Favorite Articles:', this.favoriteArticles);
      } else {
        // Si no es un arreglo, establece los artículos favoritos como un arreglo vacío
        this.favoriteArticles = [];
        console.log('aqui esta entrando en el else', this.favoriteArticles);
      }
    } catch (error) {
      console.error('Error parsing stored favorite articles:', error);
      // Si ocurre un error al analizar los artículos, establece los artículos favoritos como un arreglo vacío
      this.favoriteArticles = [];
    }
  }
}
