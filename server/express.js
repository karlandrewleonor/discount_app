import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import path from 'path';
import flash from 'express-flash';
import methodOverride from 'method-override';
import gzip from 'compression';
import helmet from 'helmet';
import { ENV } from '../config/env';
import { config } from '../config/app';

import nonrestricted from './routes/nonRestrictedRoute'
import upload  from './routes/uploadRoute'
import adminuser from './routes/adminUserRoute'
import member from './routes/memberRoute'
import mobile  from './routes/mobileRoute'
import memberrequest  from './routes/memberRequestRoute'
import merchantRoutes from './routes/merchantRoute';
import earnsettingsRoutes from './routes/earnSettingsRoute'
import paymethodRoutes from './routes/paymethodRoute'
import walletRoutes from './routes/walletRoute'

export default (app) => {
  app.set('port', (process.env.PORT || config.port));

  if (ENV === 'production') {
    app.use(gzip());
    // Secure your Express apps by setting various HTTP headers. Documentation: https://github.com/helmetjs/helmet
    app.use(helmet());
  }

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
  app.use(methodOverride());
  app.use(cookieParser());

  app.use(express.static(path.join(process.cwd(), 'public')));

  app.use('/api', nonrestricted);
  app.use('/api', upload);
  app.use('/api', merchantRoutes);
  app.use('/api', mobile);
  app.use('/api', adminuser);
  app.use('/api', member);
  app.use('/api', memberrequest);
  app.use('/api', earnsettingsRoutes);
  app.use('/api', paymethodRoutes);
  app.use('/api', walletRoutes);

  console.log('--------------------------');
  console.log('===> 😊  Starting Server . . .');
  console.log(`===>  Environment: ${ENV}`);
  console.log(`===>  Listening on port: ${app.get('port')}`);

  if (ENV === 'production') {
    console.log('===> 🚦  Note: In order for authentication to work in production');
    console.log('===>           you will need a secure HTTPS connection');
  }
  console.log('--------------------------');

  app.use(flash());
};
