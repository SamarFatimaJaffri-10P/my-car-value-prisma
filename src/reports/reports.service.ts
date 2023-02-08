import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dtos/create-report.dto';
import { GetEstimateDto } from './dtos/get-estimate.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // `{ make }` directly get the return value from the function, {} helps destructure the object
  createEstimate({ make, model, lng, lat, year, mileage }: GetEstimateDto) {
    return this.prisma.report.aggregate({
      _avg: {
        price: true,
      },
      where: {
        make: make,
        model: model,
        lng: { lte: lng + 5, gte: lng - 5 },
        lat: { lte: lat + 5, gte: lat - 5 },
        year: { lte: year + 3, gte: year - 3 },
        approved: true,
        mileage: mileage,
      },
      orderBy: {
        mileage: 'desc',
      },
      take: 3,
    });
  }

  create(reportDto: CreateReportDto, user: User) {
    const report = this.prisma.report.create({
      data: { ...reportDto, user: { connect: { id: user.id } } },
    });
    return report;
  }

  async changeApproval(id: string, approved: boolean) {
    const report = await this.prisma.report.findFirst({
      where: { id: parseInt(id) },
    });
    if (!report) {
      throw new NotFoundException('report not found');
    }

    return this.prisma.report.update({
      where: { id: parseInt(id) },
      data: {
        approved: approved,
      },
    });
  }
}
