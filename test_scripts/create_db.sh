# Create app table and user

sudo mysqladmin create GOODLYALBUMS_TEST

sudo mysql -Be " \
  GRANT SELECT,INSERT,UPDATE,DELETE \
       ,CREATE,DROP,ALTER
  ON GOODLYALBUMS_TEST.* \
  TO 'goodlyalbums-test'@'localhost' \
  IDENTIFIED BY 'goodlyalbums-test'; \
  FLUSH PRIVILEGES;"
