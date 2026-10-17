<?php
$feedUrl = 'https://api.lu.ma/ics/get?entity=calendar&id=cal-cWPY5Bxq8jZTocG';
$calendarUrl = 'https://luma.com/sheships';
$cacheFile = rtrim(sys_get_temp_dir(), '/') . '/sheships-luma-events.json';
$cacheSeconds = 600;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=120');
header('X-Content-Type-Options: nosniff');

function sheships_fetch($url)
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, array(
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 8,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_HTTPHEADER => array('Accept: text/calendar'),
            CURLOPT_USERAGENT => 'sheships.dev events',
        ));
        $body = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return ($body !== false && $status >= 200 && $status < 300) ? $body : null;
    }
    $context = stream_context_create(array('http' => array('timeout' => 8, 'header' => "Accept: text/calendar\r\n")));
    $body = @file_get_contents($url, false, $context);
    return $body === false ? null : $body;
}

function sheships_unescape($value)
{
    $value = preg_replace('/\\\\n/i', "\n", $value);
    return preg_replace('/\\\\([,;\\\\])/', '$1', $value);
}

function sheships_split_line($line)
{
    $quoted = false;
    $length = strlen($line);
    for ($i = 0; $i < $length; $i++) {
        if ($line[$i] === '"') {
            $quoted = !$quoted;
        } elseif ($line[$i] === ':' && !$quoted) {
            return array(substr($line, 0, $i), substr($line, $i + 1));
        }
    }
    return null;
}

function sheships_parse_events($text)
{
    $text = str_replace(array("\r\n", "\r"), "\n", $text);
    $text = preg_replace('/\n[ \t]/', '', $text);
    $events = array();
    $current = null;
    foreach (explode("\n", $text) as $line) {
        $trimmed = trim($line);
        if ($trimmed === 'BEGIN:VEVENT') {
            $current = array();
            continue;
        }
        if ($trimmed === 'END:VEVENT') {
            if ($current !== null) {
                $events[] = $current;
            }
            $current = null;
            continue;
        }
        if ($current === null) {
            continue;
        }
        $split = sheships_split_line($line);
        if ($split === null) {
            continue;
        }
        $parts = explode(';', $split[0]);
        $name = strtoupper(array_shift($parts));
        $params = array();
        foreach ($parts as $part) {
            $eq = strpos($part, '=');
            if ($eq > 0) {
                $params[strtoupper(substr($part, 0, $eq))] = trim(substr($part, $eq + 1), '"');
            }
        }
        if (!isset($current[$name])) {
            $current[$name] = array('value' => trim($split[1]), 'params' => $params);
        }
    }
    return $events;
}

function sheships_parse_date($field)
{
    if (!$field || !preg_match('/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/', $field['value'], $m)) {
        return null;
    }
    $allDay = !isset($m[4]) || $m[4] === '';
    $zoneName = 'America/New_York';
    if (!empty($m[7])) {
        $zoneName = 'UTC';
    } elseif (!empty($field['params']['TZID'])) {
        $zoneName = $field['params']['TZID'];
    }
    try {
        $zone = new DateTimeZone($zoneName);
    } catch (Exception $e) {
        $zone = new DateTimeZone('America/New_York');
    }
    $string = sprintf('%s-%s-%s %s:%s:%s', $m[1], $m[2], $m[3], $allDay ? '00' : $m[4], $allDay ? '00' : $m[5], ($allDay || empty($m[6])) ? '00' : $m[6]);
    $date = DateTime::createFromFormat('Y-m-d H:i:s', $string, $zone);
    return $date ? array('time' => $date->getTimestamp(), 'allDay' => $allDay) : null;
}

function sheships_to_event($raw, $calendarUrl)
{
    $start = sheships_parse_date(isset($raw['DTSTART']) ? $raw['DTSTART'] : null);
    if (!$start) {
        return null;
    }
    $end = sheships_parse_date(isset($raw['DTEND']) ? $raw['DTEND'] : null);
    $endTime = $end ? $end['time'] : $start['time'] + ($start['allDay'] ? 86400 : 0);

    $id = null;
    $fields = isset($raw['UID']) ? array_merge(array($raw['UID']), array_values($raw)) : array_values($raw);
    foreach ($fields as $field) {
        if (preg_match('/evt-[A-Za-z0-9]+/', $field['value'], $m)) {
            $id = $m[0];
            break;
        }
    }

    $url = isset($raw['URL']) ? $raw['URL']['value'] : null;
    if (!$url) {
        $text = '';
        foreach (array('DESCRIPTION', 'LOCATION') as $key) {
            if (isset($raw[$key])) {
                $text .= sheships_unescape($raw[$key]['value']) . "\n";
            }
        }
        $slug = basename(parse_url($calendarUrl, PHP_URL_PATH));
        if (preg_match_all('#https://(?:lu\.ma|luma\.com)/[^\s,;)"\'<>]+#', $text, $links)) {
            foreach ($links[0] as $link) {
                if (!preg_match('#/(calendar|embed|ics|user)/#', $link) && substr($link, -strlen($slug)) !== $slug) {
                    $url = $link;
                    break;
                }
            }
        }
    }
    if (!$url) {
        $url = $id ? 'https://luma.com/event/' . $id : $calendarUrl;
    }

    $location = '';
    if (isset($raw['LOCATION'])) {
        $lines = explode("\n", sheships_unescape($raw['LOCATION']['value']));
        $location = trim($lines[0]);
        if (preg_match('#^https?://#', $location)) {
            $location = '';
        }
    }

    return array(
        'id' => $id,
        'title' => isset($raw['SUMMARY']) ? trim(sheships_unescape($raw['SUMMARY']['value'])) : 'She Ships event',
        'start' => gmdate('Y-m-d\TH:i:s.000\Z', $start['time']),
        'end' => gmdate('Y-m-d\TH:i:s.000\Z', $endTime),
        'allDay' => $start['allDay'],
        'url' => $url,
        'location' => $location,
        'endTime' => $endTime,
        'startTime' => $start['time'],
    );
}

function sheships_build($text, $calendarUrl)
{
    $now = time();
    $events = array();
    foreach (sheships_parse_events($text) as $raw) {
        $event = sheships_to_event($raw, $calendarUrl);
        if ($event && $event['endTime'] > $now) {
            $events[] = $event;
        }
    }
    usort($events, function ($a, $b) {
        return $a['startTime'] - $b['startTime'];
    });
    foreach ($events as &$event) {
        unset($event['endTime'], $event['startTime']);
    }
    unset($event);
    return array('fetchedAt' => gmdate('Y-m-d\TH:i:s\Z'), 'events' => $events);
}

$cached = is_readable($cacheFile) ? @file_get_contents($cacheFile) : false;
if ($cached !== false && (time() - filemtime($cacheFile)) < $cacheSeconds) {
    echo $cached;
    exit;
}

$body = sheships_fetch($feedUrl);
if ($body !== null && strpos($body, 'BEGIN:VCALENDAR') !== false) {
    $json = json_encode(sheships_build($body, $calendarUrl), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    @file_put_contents($cacheFile, $json, LOCK_EX);
    echo $json;
    exit;
}

if ($cached !== false) {
    echo $cached;
    exit;
}

http_response_code(503);
echo json_encode(null);
