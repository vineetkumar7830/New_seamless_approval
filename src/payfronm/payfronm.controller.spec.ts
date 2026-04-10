import { Test, TestingModule } from '@nestjs/testing';
import { PayFromController } from './payfronm.controller';
import { PayFromService } from './payfronm.service';

describe('PayfronmController', () => {
  let controller: PayFromController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayFromController],
      providers: [PayFromService],
    }).compile();

    controller = module.get<PayFromController>(PayFromController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
