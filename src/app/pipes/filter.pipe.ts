import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter', // Nombre del filtro que se usará en las plantillas
})
export class FilterPipe implements PipeTransform {
  
  transform(items: any[], searchText: string, key: string = 'title'): any[] {
    // Verifica si la matriz de elementos o el criterio de búsqueda están vacíos
    if (!items || !searchText) {
      return items; // Devuelve la matriz sin cambios si no hay elementos o no hay criterio de búsqueda
    }

    searchText = searchText.toLowerCase(); // Convierte el criterio de búsqueda a minúsculas para hacer una comparación insensible a mayúsculas
    console.log(searchText); // Imprime el criterio de búsqueda en minúsculas para fines de depuración

    // Filtra los elementos según el criterio de búsqueda y la clave especificada (por defecto 'title')
    return items.filter(item => {
      return item[key].toLowerCase().includes(searchText); // Comprueba si el valor de la clave incluye el criterio de búsqueda
    });
  }
}
