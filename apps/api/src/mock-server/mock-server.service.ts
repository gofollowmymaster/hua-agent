import { Injectable } from '@nestjs/common';
import { MockServerCreate, MockServerGet } from './dto/mock-server.dto';
import { ErrorMessagesCode, ErrorMessages } from './errEnum';
import {
  getGateWayName,
  getMockServerFilePath,
} from '@src/common/utils/mockserverUtils';
import fs from 'fs-extra';
import { logger } from '@src/common/service/logger/logger.config';
//录制操作
//1.查看createParams的url 比如url是/catalog/aplus/newermodel/page
//2.根据url获取网关名称 比如获取到的网关名称是catalog
//3.根据网关名称catalog查看MockServerCreate文件夹下是否有catalog.json文件
//4.如果有则写入对象,createParams的url作为key,createParams的response作为value
//5.如果没有则创建一个catalog.json文件,并写入对象,createParams的url作为key,createParams的response作为value
//6.写入返程后返回{code:200,message:'请求路径/catalog/aplus/newermodel/page写入成功，写入文件路径是mockServer是catalog.json'}，
//7.写入返程后返回{code:10000,message:'请求路径/catalog/aplus/newermodel/page写入失败，写入文件路径是mockServer是catalog.json'}，

@Injectable()
export class MockServerService {
  async createMock(createParams: MockServerCreate) {
    const { url, response } = createParams;
    if (!url || !response) {
      logger.info(ErrorMessages.ERROR_PARAMS);
      return {
        code: ErrorMessagesCode.ERROR_PARAMS,
        message: ErrorMessages.ERROR_PARAMS,
      };
    }
    const gateWayName = getGateWayName(url);
    const path = getMockServerFilePath(gateWayName);
    const isFileExist = await fs.pathExists(path);
    if (isFileExist) {
      try {
        const sourceJson = await fs.readJson(path);
        const newJson = { ...sourceJson, [url]: response };
        await fs.writeJson(path, newJson, { spaces: '\t' });
      } catch (e) {
        return {
          code: ErrorMessagesCode.WRITE_ERROR,
          message: `【${url}】【${ErrorMessages.WRITE_ERROR}】`,
          error: e,
        };
      }
    } else {
      try {
        await fs.outputJson(path, {});
        const sourceJson = await fs.readJson(path);
        const newJson = { ...sourceJson, [url]: response };
        await fs.writeJson(path, newJson, { spaces: '\t' });
      } catch (err) {
        return {
          code: ErrorMessagesCode.WRITE_ERROR,
          message: `【${url}】【${ErrorMessages.WRITE_ERROR}】`,
          error: err,
        };
      }
    }
    return {
      code: 200,
      message: `请求路径【${url}】写入成功，写入文件路径是mockServer/${gateWayName}.json`,
    };
  }

  //回放操作
  //1.查看getParams的url 比如url是/catalog/aplus/newermodel/page
  //2.根据url获取网关名称 比如获取到的网关名称是catalog
  //3.根据网关名称catalog查看MockServerCreate文件夹下是否有catalog.json文件
  //4.如果有则读取对象,读取的key为getParams的url
  //5.如果没有则返回null
  //6.有则返回对象数据
  async getMock(getParams: MockServerGet) {
    const { url } = getParams;
    if (!url) {
      logger.info(ErrorMessages.ERROR_PARAMS_PATH);
      return {
        code: ErrorMessagesCode.ERROR_PARAMS_PATH,
        message: ErrorMessages.ERROR_PARAMS_PATH,
      };
    }
    const gateWayName = getGateWayName(url);
    const path = getMockServerFilePath(gateWayName);
    const isFileExist = await fs.pathExists(path);
    if (!isFileExist) {
      return null;
    } else {
      try {
        const fileObj = await fs.readJson(path);
        if (fileObj.hasOwnProperty(url)) {
          return fileObj[url];
        } else {
          return null;
        }
      } catch (err) {
        return null;
      }
    }
  }
}
