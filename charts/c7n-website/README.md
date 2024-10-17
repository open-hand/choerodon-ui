# Choerodon Front
Choerodon Front 将多个Choerodon 微前端打包到同一个前端服务中。

## Introduction

## Add Helm chart repository

``` bash    
helm repo add choerodon https://openchart.choerodon.com.cn/choerodon/c7n
helm repo update
```

## Installing the Chart

```bash
$ helm install c7n/choerodon-front --name choerodon-front
```

Specify each parameter using the `--set key=value[,key=value]` argument to `helm install`.

## Uninstalling the Chart

```bash
$ helm delete choerodon-front
```

## Configuration

Parameter | Description	| Default
--- |  ---  |  ---  
`replicaCount` | Replicas count | `1`
`env.open.API_HOST` | 后端网关地址 | `http://gateway.example.com`
`env.open.WEBSOCKET_SERVER` | 后端消息服务ws地址 | `ws://ws.example.com`
`env.open.FILE_SERVER` | 文件服务地址 | `http://minio.example.com`
`env.open.COOKIE_SERVER` | cookie 共享地址 | `http://choerodon.example.com`
`env.open.DEVOPS_HOST` | Devops 后端服务地址 | `ws://devops.choerodon.example.com`
`env.open.BUZZ_WEBSOCKET_URL` | Buzz 后端服务地址 | `ws://buzz.example.com`
`env.open.CLIENT_ID` | 总前端对应的后端客户端id | `choerodon`
`env.open.FEEDBACK_TOKENS` | feedback 应用token | ``
`env.open.HTTP` | 前端域名协议 | `http`
`env.open.LOCAL` | 是否为本地开发 | `false`
`env.open.CUSTOM_THEME_COLOR` | 默认主题色 | `undefined`
`env.open.EMAIL_BLACK_LIST` | 注册屏蔽邮箱 | `qq.com,gmail.com,sina.com,163.com,sina.cn,126.com,yeah.net,189.cn,foxmail.com,msn.cn,hotmail.com,outlook.com,yahoo.com,139.com`
`service.port` | service端口 | `80`
`service.enabled` | 是否创建svc | `false`
`ingress.enabled` | 是否创建ingress | `false`
`ingress.host` | ingress 地址 | `choerodon.example.com`
`logs.parser` | 日志收集格式 | `nginx`
`resources.limits` | k8s中容器能使用资源的资源最大值 | ``
`resources.requests` | k8s中容器使用的最小资源需求 | ``


## 验证部署
```bash
curl $(kubectl get svc choerodon-front -o jsonpath="{.spec.clusterIP}" -n c7n-system)
```
出现以下类似信息即为成功部署

```bash
<!DOCTYPE html><html><head><meta http-equiv="Content-type"content="text/html; charset=utf-8"><title>Choerodon</title><link rel="shortcut icon"href="favicon.ico"></head><body><div id="app"></div><script type="text/javascript"src="app/vendor_19e4b950.js"></script><script type="text/javascript"src="app/main_19e4b950.js"></script></body></html>
```

