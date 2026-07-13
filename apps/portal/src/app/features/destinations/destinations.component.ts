import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';

@Component({ selector: 'viajes-destinations', standalone: true, imports: [RouterLink, IonContent], templateUrl: './destinations.component.html', styleUrl: './destinations.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class DestinationsComponent {
  protected readonly destinations = [
    { name: 'La Habana', description: 'Arquitectura, musica y vida de barrio.', image: 'https://images.unsplash.com/photo-1500759285222-a95626b934cb?auto=format&fit=crop&w=900&q=80' },
    { name: 'Vinales', description: 'Naturaleza, tabaco y caminos entre mogotes.', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80' },
    { name: 'Trinidad', description: 'Calles de piedra, cultura y atardeceres.', image: 'https://images.unsplash.com/photo-1544986581-efac024faf62?auto=format&fit=crop&w=900&q=80' },
    { name: 'Varadero', description: 'Mar, descanso y dias largos de playa.', image: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=900&q=80' }
  ];
}
