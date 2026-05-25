import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RoutesModule } from './modules/routes/routes.module';
import { TripsModule } from './modules/trips/trips.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { ChatModule } from './modules/chat/chat.module';
import { DelaysModule } from './modules/delays/delays.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { BusesModule } from './modules/buses/buses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RoutesModule,
    TripsModule,
    BookingsModule,
    PaymentsModule,
    FavoritesModule,
    ChatModule,
    DelaysModule,
    TicketsModule,
    BusesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}