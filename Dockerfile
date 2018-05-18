FROM nginx
RUN echo "Asia/shanghai" > /etc/timezone;
ADD . /usr/share/nginx/html
ADD auto_devops/default.conf /etc/nginx/conf.d/default.conf
