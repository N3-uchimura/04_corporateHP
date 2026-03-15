/**
 * form.ts
 **
 * function：メイン
**/

'use strict';

// 名前空間
import { myConst } from './consts/globalvariables';

// モジュール定義
import * as path from 'node:path'; // パス用
import { config as dotenv } from 'dotenv'; // 環境変数用
import express from 'express'; // http通信用
import helmet from 'helmet'; // XSS対策用
import { xss } from 'express-xss-sanitizer'; // サニタイズ用
import Logger from './class/Logger'; // ロガー
import SQL from './class/MySqlJoinShort'; // DB

/// モジュール設定
// 環境変数
dotenv({ path: path.join(__dirname, '.env') });
// ロガー設定
const logger: Logger = new Logger(myConst.COMPANY_NAME, myConst.APP_NAME, undefined, myConst.LOG_LEVEL);
// DB設定
const myDB: SQL = new SQL(
  process.env.SQL_HOST!, // ホスト名
  process.env.SQL_COMMON_USER!, // ユーザ名
  process.env.SQL_COMMON_PASS!, // ユーザパスワード
  Number(process.env.SQL_PORT), // ポートNO
  process.env.SQL_DBNAME!, // DB名
  logger, // ロガー
);
logger.info('configuration started');
// ポート番号
const defaultPort: number = Number(process.env.SERVER_PORT);
// express設定
const app: any = express(); // express初期化
app.use(express.json()); // json設定
app.use(
  express.urlencoded({
    extended: true, // body parser使用
  })
);
app.use(express.static(path.join(__dirname, 'public'))); // public使用
app.set('views', path.join(__dirname, 'views')); // views使用
app.set('view engine', 'ejs'); // ejs使用
// XSS対策
app.use(xss());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "cdnjs.cloudflare.com",
          "ajax.googleapis.com",
        ],
        "img-src": ["'self'", "data: image:", "http://www.w3.org/2000/svg"],
        "connect-src": ["'self'", "cdnjs.cloudflare.com"],
      },
    },
  }),
);
logger.info('corporate: configuration completed');

// トップ画面
app.get('/', async (_: any, res: any) => {
  try {
    logger.debug('corporate: top get');
    // トップ画面
    res.render('index', { title: 'NUMTHREE -moderate future-' });

  } catch (e: unknown) {
    logger.error(e);
    // エラー
    res.render('error', {
      title: '404',
      message: 'Not Found',
    });
  }
});

// サービス画面
app.get('/service', async (_: any, res: any) => {
  try {
    logger.debug('corporate: service get');
    // トップ画面
    res.render('service', { title: 'NUMTHREE -サービス一覧-' });

  } catch (e: unknown) {
    logger.error(e);
    // エラー
    res.render('error', {
      title: '404',
      message: 'Not Found',
    });
  }
});

// 嫁ティア画面
app.get('/yomitia', async (_: any, res: any) => {
  try {
    logger.debug('corporate: yometia get');
    // トップ画面
    res.render('yomitia', { title: 'NUMTHREE -朗読アプリ「読みティア」-' });

  } catch (e: unknown) {
    logger.error(e);
    // エラー
    res.render('error', {
      title: '404',
      message: 'Not Found',
    });
  }
});

// チーム画面
app.get('/team', async (_: any, res: any) => {
  try {
    logger.debug('corporate: team get');
    // トップ画面
    res.render('team', { title: 'NUMTHREE -チーム概要-' });

  } catch (e: unknown) {
    logger.error(e);
    // エラー
    res.render('error', {
      title: '404',
      message: 'Not Found',
    });
  }
});

// フォーム画面
app.get('/contact', async (_: any, res: any) => {
  try {
    logger.debug('corporate: contact get');
    // 成功
    res.render('contact', { title: 'NUMTHREE -お問い合わせ-' });

  } catch (e: unknown) {
    logger.error(e);
    // エラー
    res.render('error', {
      title: '404',
      message: 'Not Found',
    });
  }
});

// 確認画面
app.get('/confirm', async (_: any, res: any) => {
  try {
    logger.debug('corporate: form confirm get');
    // 確認画面
    res.render('confirm', { title: 'NUMTHREE -確認画面-' });

  } catch (e: unknown) {
    logger.error(e);
    // エラー
    res.render('error', {
      title: '404',
      message: 'Not Found',
    });
  }
});

// フォーム登録
app.post('/form', async (req: any, res: any) => {
  try {
    // モード
    logger.info('corporate: form post');
    // 受け取りデータ
    const customername: any = req.body.customername ?? '';
    const customermail: any = req.body.customermail ?? '';
    const content: any = req.body.content ?? '';
    // 対象データ
    const insertDataArgs: insertargs = {
      table: 'contact', // テーブル
      columns: ['customername', 'customermail', 'content', 'usable'], // カラム
      values: [customername, customermail, content, 1], // 値
    };
    // インサートID
    const insertedId: any = await myDB.insertDB(insertDataArgs);
    // 結果
    if (insertedId == 'error' || insertedId == 'empty') {
      // エラー
      throw new Error('insertData: insert error');
    }
    // 確認画面
    res.render('confirm', {
      title: 'NUMTHREE -確認画面-',
      customerid: insertedId,
      customername: customername,
      customermail: customermail,
      content: content,
    });

  } catch (e: unknown) {
    logger.error(e);
    // エラー
    res.render('error', {
      title: '404',
      message: 'Not Found',
    });
  }
});

// フォーム確定
app.post('/confirmed', async (req: any, res: any) => {
  try {
    // モード
    logger.info('corporate: form post');
    // 受け取りデータ
    const customerid: any = req.body.customerid;
    // なしならエラー
    if (!customerid) {
      // エラー
      throw new Error('confirmed: no customerid error');
    }
    // 対象データ
    const updateArgs: updateargs = {
      table: 'contact', // テーブル
      setcol: ['ready'], // 準備完了
      setval: [1], // 完了
      selcol: ['id', 'usable'], // 対象
      selval: [customerid, 1], // 対象値
    };
    // 更新処理
    const updateResult = await myDB.updateDB(updateArgs);
    // 結果
    if (updateResult == 'error') {
      // エラー
      throw new Error('mysql: updateData error');
    } else if (updateResult == 'empty') {
      // 対象なし
      logger.trace('mysql: updateData empty');
    }
    // 確認画面
    res.render('finish', { title: 'NUMTHREE -完了画面-' });

  } catch (e: unknown) {
    logger.error(e);
    // エラー
    res.render('error', {
      title: '404',
      message: 'Not Found',
    });
  }
});

// エラーハンドラ
app.use(
  (
    err: Error,
    _: express.Request,
    res: express.Response,
    __: express.NextFunction,
  ) => {
    logger.error(err);
    // エラー
    res.render('error', {
      title: '404',
      message: 'Not Found',
    });
  }
);

// 待機
app.listen(defaultPort, () => {
  try {
    logger.info(`${myConst.SERVER_NAME} listening at ${myConst.DEFAULT_URL}:${defaultPort}`);
  } catch (e) {
    logger.error(e);
  }
});
