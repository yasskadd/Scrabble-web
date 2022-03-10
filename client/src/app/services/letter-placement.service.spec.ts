import { TestBed } from '@angular/core/testing';

import { LetterPlacementService } from './letter-placement.service';

describe('LetterPlacementService', () => {
  let service: LetterPlacementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LetterPlacementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
