import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayListsComponent } from './play-lists.component';

describe('PlayListsComponent', () => {
  let component: PlayListsComponent;
  let fixture: ComponentFixture<PlayListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayListsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
