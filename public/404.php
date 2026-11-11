<?php
http_response_code(404);
header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex');
header('Cache-Control: no-cache');
readfile(__DIR__ . '/404.html');
