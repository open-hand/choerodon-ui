FROM registry.cn-shanghai.aliyuncs.com/c7n/frontbase:0.9.0

RUN echo "Asia/shanghai" > /etc/timezone;

COPY ./docker/default.conf /etc/nginx/conf.d/
# RUN chown -R nginx:nginx /usr/share/nginx/html
COPY ./ /usr/share/nginx/html/choerodon-ui
COPY ./index.html /usr/share/nginx/html/index.html
COPY ./index.html /usr/share/nginx/html/404.html
# USER 101
CMD ["nginx", "-g", "daemon off;"]
