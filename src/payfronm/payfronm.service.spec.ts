import { Test, TestingModule } from '@nestjs/testing';
import { PayFromService } from './payfronm.service';


describe('PayfronmService', () => {
  let service: PayFromService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayFromService],
    }).compile();

    service = module.get<PayFromService>(PayFromService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
