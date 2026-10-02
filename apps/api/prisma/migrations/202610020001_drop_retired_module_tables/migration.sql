ALTER TABLE `AlertMessageUser`
  DROP FOREIGN KEY `AlertMessageUser_messageId_fkey`;

DROP TABLE `AlertMessageUser`;
DROP TABLE `AlertMessage`;
