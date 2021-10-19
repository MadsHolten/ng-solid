import { TestBed } from '@angular/core/testing';

import { SolidAuthService } from './solid-auth.service';

describe('SolidAuthService', () => {
  let service: SolidAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolidAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
